import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type V = [number, number, number];
type Pose = { position?: V; rotation?: V; scale?: V | number };
type ModelProps = {
  id: number;
  stage?: number;
  animate?: boolean;
  onSelect?: () => void;
};

// Reused by every instance. dispose={null} keeps R3F model swaps from destroying
// shared resources. Only the small, deforming root buffers are instance-owned.
const round = new THREE.SphereGeometry(1, 18, 12);
const floret = new THREE.SphereGeometry(1, 10, 7);
const palette = new Map<string, THREE.MeshStandardMaterial>();
function paint(color: string, roughness = 0.78) {
  const key = color + roughness;
  if (!palette.has(key))
    palette.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        side: THREE.DoubleSide,
      }),
    );
  return palette.get(key)!;
}
const wingMaterial = new THREE.MeshStandardMaterial({
  color: "#e6f4ed",
  roughness: 0.37,
  metalness: 0.04,
  transparent: true,
  opacity: 0.75,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const tubeCache = new Map<string, THREE.BufferGeometry>();
const bark = "#a89371",
  barkLight = "#c1b08c",
  rootBrown = "#88785a",
  ink = "#163e35";

// A sectioned surface gives the birds shoulders, necks and haunches rather than
// stretching the same sphere. Each ring has its own width, depth and centre.
type Rings = [number, number, number, number][];
function smoothProfile(rings: Rings) {
  const shape = new THREE.CatmullRomCurve3(
    rings.map(([y, rx, rz]) => new THREE.Vector3(rx, y, rz)),
  );
  const offset = new THREE.CatmullRomCurve3(
    rings.map(([y, , , z]) => new THREE.Vector3(z, y, 0)),
  );
  return Array.from({ length: 33 }, (_, i) => {
    const p = shape.getPoint(i / 32),
      c = offset.getPoint(i / 32);
    return [p.y, Math.max(0.005, p.x), Math.max(0.005, p.z), c.x] as [
      number,
      number,
      number,
      number,
    ];
  });
}
function bodyGeometry(input: Rings) {
  const rings = smoothProfile(input);
  const positions: number[] = [],
    indices: number[] = [],
    sides = 24;
  rings.forEach(([y, rx, rz, z]) => {
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      positions.push(Math.cos(a) * rx, y, Math.sin(a) * rz + z);
    }
  });
  for (let r = 0; r < rings.length - 1; r++)
    for (let j = 0; j < sides; j++) {
      const a = r * (sides + 1) + j,
        b = a + sides + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
const parrotRings: Rings = [
  [0, 0.015, 0.015, 0],
  [0.08, 0.24, 0.23, 0],
  [0.25, 0.4, 0.34, 0.01],
  [0.53, 0.44, 0.38, 0.06],
  [0.8, 0.33, 0.29, 0.1],
  [1.02, 0.18, 0.2, 0.08],
  [1.08, 0.02, 0.02, 0.06],
];
const wrenRings: Rings = [
  [0, 0.015, 0.015, 0],
  [0.12, 0.25, 0.24, 0.02],
  [0.35, 0.39, 0.34, 0.02],
  [0.6, 0.37, 0.35, 0.07],
  [0.85, 0.23, 0.24, 0.11],
  [0.99, 0.02, 0.02, 0.12],
];
const kookRings: Rings = [
  [0, 0.015, 0.015, 0],
  [0.13, 0.32, 0.27, -0.04],
  [0.42, 0.45, 0.37, 0.02],
  [0.7, 0.4, 0.32, 0.06],
  [0.95, 0.23, 0.24, 0.08],
  [1.05, 0.02, 0.02, 0.08],
];
const birdBody = bodyGeometry(parrotRings),
  wrenBody = bodyGeometry(wrenRings),
  kookBody = bodyGeometry(kookRings);
// Coloured feathers lie on the actual torso surface, with a tiny normal offset.
// Unlike intersecting spheres this gives a clean, deliberately drawn bib edge.
function chestGeometry(
  rings: Rings,
  min: number,
  max: number,
  width = 0.95,
  offset = 0.009,
) {
  const profile = smoothProfile(rings),
    positions: number[] = [],
    indices: number[] = [];
  const rows = 18,
    cols = 16;
  for (let i = 0; i <= rows; i++) {
    const u = i / rows,
      y = min + (max - min) * u;
    const ix = Math.max(0, profile.findIndex((p) => p[0] >= y) - 1),
      a = profile[ix],
      b = profile[Math.min(ix + 1, profile.length - 1)];
    const t = (y - a[0]) / Math.max(0.0001, b[0] - a[0]);
    const rx = THREE.MathUtils.lerp(a[1], b[1], t),
      rz = THREE.MathUtils.lerp(a[2], b[2], t),
      cz = THREE.MathUtils.lerp(a[3], b[3], t);
    for (let j = 0; j <= cols; j++) {
      const theta =
        Math.PI / 2 +
        ((j / cols) * 2 - 1) * width * Math.pow(Math.sin(Math.PI * u), 0.37);
      positions.push(
        Math.cos(theta) * (rx + offset),
        y,
        Math.sin(theta) * (rz + offset) + cz,
      );
    }
  }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j,
        b = a + cols + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
const parrotChest = chestGeometry(parrotRings, 0.1, 0.78),
  wrenChest = chestGeometry(wrenRings, 0.13, 0.78, 0.96),
  kookChest = chestGeometry(kookRings, 0.13, 0.91, 0.85);
const parrotBib = chestGeometry(parrotRings, 0.66, 1.015, 0.98, 0.017),
  parrotCollar = chestGeometry(parrotRings, 0.86, 1.06, 0.88, 0.025);
const parrotHead = bodyGeometry([
  [-0.39, 0.025, 0.025, 0],
  [-0.28, 0.28, 0.26, 0.04],
  [-0.08, 0.39, 0.34, 0.035],
  [0.17, 0.37, 0.32, -0.025],
  [0.34, 0.24, 0.23, -0.04],
  [0.42, 0.02, 0.02, -0.04],
]);
const beeAbdomen = bodyGeometry([
  [-0.67, 0.015, 0.015, 0],
  [-0.55, 0.22, 0.19, 0],
  [-0.36, 0.34, 0.29, 0],
  [-0.1, 0.39, 0.32, 0],
  [0.2, 0.33, 0.29, 0],
  [0.44, 0.22, 0.22, 0],
  [0.53, 0.02, 0.02, 0],
]);
// These five band shapes are shared across every stage and model swap. Inline
// torus children inside dispose={null} would leak a fresh GPU buffer per mount.
const beeBandGeometry = [0.289, 0.365, 0.388, 0.356, 0.297].map(
  (radius) => new THREE.TorusGeometry(radius, 0.035, 5, 28),
);
const rootCollar = bodyGeometry([
  [0, 0.25, 0.23, 0],
  [0.12, 0.29, 0.25, 0],
  [0.27, 0.24, 0.21, 0.02],
  [0.52, 0.17, 0.16, 0.04],
  [0.78, 0.11, 0.11, -0.01],
  [1.05, 0.08, 0.07, -0.04],
]);
const flowerPieces: THREE.BufferGeometry[][] = [[], []];
for (let i = 0; i < 13; i++) {
  const y = 1 - (i / 12) * 2,
    r = Math.sqrt(Math.max(0, 1 - y * y)),
    a = i * 2.4;
  const g = floret.clone();
  g.scale(0.054, 0.054, 0.054);
  g.translate(Math.cos(a) * r * 0.087, y * 0.087, Math.sin(a) * r * 0.087);
  flowerPieces[i % 3 ? 0 : 1].push(g);
}
const flowerMeshes = flowerPieces.map((parts) => {
  const g = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return g;
});
floret.dispose();

function bladeGeometry(narrow = false, feather = false) {
  const positions: number[] = [],
    indices: number[] = [];
  const rows = 12,
    cols = 6;
  for (let i = 0; i <= rows; i++) {
    const u = i / rows;
    const width =
      Math.pow(Math.sin(Math.PI * u), feather ? 0.52 : 0.83) *
        (narrow ? 0.16 : 0.3) *
        (1 - u * 0.2) +
      0.002;
    for (let j = 0; j <= cols; j++) {
      const v = (j / cols) * 2 - 1;
      positions.push(
        width * v * (feather && v < 0 ? 0.72 : 1),
        u,
        Math.sin(Math.PI * u) * 0.08 * (1 - v * v) +
          u * u * (feather ? -0.13 : 0.2),
      );
    }
  }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j,
        b = a + cols + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
const leaf = bladeGeometry(),
  lanceolate = bladeGeometry(true),
  featherShape = bladeGeometry(false, true);

function taperedGeometry(
  points: V[],
  start: number,
  end: number,
  steps = 14,
  radial = 7,
) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
  );
  const positions: number[] = [],
    indices: number[] = [];
  const up = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= steps; i++) {
    const u = i / steps,
      center = curve.getPoint(u),
      tangent = curve.getTangent(u).normalize();
    const normal = new THREE.Vector3()
      .crossVectors(
        tangent,
        Math.abs(tangent.z) > 0.92 ? new THREE.Vector3(0, 1, 0) : up,
      )
      .normalize();
    const binormal = new THREE.Vector3()
      .crossVectors(tangent, normal)
      .normalize();
    const radius = start * Math.pow(1 - u, 0.8) + end * u;
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const p = center
        .clone()
        .addScaledVector(normal, Math.cos(a) * radius)
        .addScaledVector(binormal, Math.sin(a) * radius);
      positions.push(p.x, p.y, p.z);
    }
  }
  for (let i = 0; i < steps; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j,
        b = a + radial + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function Curve({
  points,
  radius = 0.035,
  tip = 0.008,
  color = bark,
  ...pose
}: Pose & { points: V[]; radius?: number; tip?: number; color?: string }) {
  const key = JSON.stringify([points, radius, tip]);
  if (!tubeCache.has(key))
    tubeCache.set(key, taperedGeometry(points, radius, tip));
  return (
    <mesh
      {...pose}
      geometry={tubeCache.get(key)}
      material={paint(color)}
      castShadow
      dispose={null}
    />
  );
}
function Pebble({ color, ...pose }: Pose & { color: string }) {
  return (
    <mesh
      {...pose}
      geometry={round}
      material={paint(color)}
      castShadow
      receiveShadow
      dispose={null}
    />
  );
}
function Blade({
  color,
  narrow = false,
  feather = false,
  vein = false,
  ...pose
}: Pose & {
  color: string;
  narrow?: boolean;
  feather?: boolean;
  vein?: boolean;
}) {
  return (
    <group {...pose}>
      <mesh
        geometry={feather ? featherShape : narrow ? lanceolate : leaf}
        material={paint(color, feather ? 0.83 : 0.65)}
        castShadow
        receiveShadow
        dispose={null}
      />
      {vein && (
        <Curve
          points={[
            [0, 0, 0.007],
            [0, 0.45, 0.08],
            [0, 0.96, 0.19],
          ]}
          radius={0.011}
          tip={0.003}
          color={color === "#8fae9b" ? "#c2d0b2" : "#b5c48c"}
        />
      )}
    </group>
  );
}
function EyePair({
  position = [0, 0, 0],
  spread = 0.17,
  scale = 1,
  animate,
  seed = 0,
}: {
  position?: V;
  spread?: number;
  scale?: number;
  animate: boolean;
  seed?: number;
}) {
  const lids = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!lids.current) return;
    const phase = (clock.elapsedTime + seed * 0.43) % 5.8;
    lids.current.scale.y =
      animate && phase > 5.52
        ? Math.max(0.08, Math.abs(phase - 5.66) / 0.14)
        : 1;
  });
  return (
    <group position={position} scale={scale}>
      <group ref={lids}>
        {[-1, 1].map((s) => (
          <group
            key={s}
            position={[s * spread, 0, 0]}
            rotation={[0, s * 0.12, 0]}
          >
            <Pebble scale={[0.095, 0.119, 0.049]} color="#fff9e9" />
            <Pebble
              position={[s * -0.012, -0.008, 0.042]}
              scale={[0.063, 0.09, 0.027]}
              color={ink}
            />
            <Pebble
              position={[-0.018, 0.029, 0.065]}
              scale={0.021}
              color="#fffdf1"
            />
          </group>
        ))}
      </group>
    </group>
  );
}

// Five or six roots radiate from a root collar. Most stay load-bearing while
// one free tendril curls and extends. The collar is never bounced off the soil.
function Root({
  angle,
  length,
  index,
  animate,
  color = rootBrown,
}: {
  angle: number;
  length: number;
  index: number;
  animate: boolean;
  color?: string;
}) {
  const geometry = useMemo(
    () =>
      taperedGeometry(
        [
          [0, 0.18, 0],
          [0.18, 0.12, 0],
          [length * 0.7, 0.055, 0],
          [length, 0.025, 0.06],
        ],
        0.095,
        0.008,
        10,
        7,
      ),
    [length],
  );
  const rest = useMemo(
    () => new Float32Array(geometry.attributes.position.array),
    [geometry],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    const p = geometry.attributes.position as THREE.BufferAttribute;
    const wave = animate
      ? Math.max(0, Math.sin(clock.elapsedTime * 0.6 + index * 1.35) - 0.45) /
        0.55
      : 0;
    // The outer section lifts only during its recovery stroke. All other roots
    // remain on the ground; there is no two-legged or foot-shaped plant gait.
    for (let i = 0; i < p.count; i++) {
      const u = Math.floor(i / 8) / 10;
      p.setXYZ(
        i,
        rest[i * 3] - wave * 0.055 * u * u,
        rest[i * 3 + 1] + wave * 0.075 * Math.pow(u, 3),
        rest[i * 3 + 2] + wave * 0.045 * Math.sin(u * Math.PI),
      );
    }
    p.needsUpdate = true;
    if (wave > 0) geometry.computeVertexNormals();
  });
  return (
    <group rotation={[0, angle, 0]}>
      <mesh
        geometry={geometry}
        material={paint(color)}
        castShadow
        receiveShadow
        dispose={null}
      />
      <Curve
        points={[
          [length * 0.64, 0.055, 0.025],
          [length * 0.8, 0.032, -0.1],
          [length * 0.93, 0.021, -0.14],
        ]}
        radius={0.025}
        tip={0.003}
        color={color}
      />
    </group>
  );
}
function Roots({
  stage,
  animate,
  tree = false,
}: {
  stage: number;
  animate: boolean;
  tree?: boolean;
}) {
  const count = tree ? 6 : 5;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <Root
          key={i}
          index={i}
          angle={(i / count) * Math.PI * 2 + 0.23}
          length={(tree ? 0.54 : 0.49) + stage * 0.045 + (i % 2) * 0.08}
          animate={animate}
          color={tree ? "#9b9079" : rootBrown}
        />
      ))}
    </group>
  );
}

function WattleFlower({ scale = 1, ...pose }: Pose) {
  return (
    <group {...pose} scale={scale}>
      <Pebble scale={0.095} color="#dbb743" />
      {flowerMeshes.map((geometry, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={paint(i ? "#f8e397" : "#f0d36e")}
          castShadow
          dispose={null}
        />
      ))}
    </group>
  );
}
function Wattle({ stage, animate }: { stage: number; animate: boolean }) {
  const crown = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (crown.current) {
      crown.current.rotation.z = animate
        ? Math.sin(clock.elapsedTime * 0.8) * 0.025
        : 0;
      crown.current.rotation.x = animate
        ? Math.sin(clock.elapsedTime * 0.6) * 0.018
        : 0;
    }
  });
  return (
    <group scale={stage === 1 ? 0.9 : stage === 2 ? 1 : 1.04}>
      <Roots stage={stage} animate={animate} />
      <mesh
        geometry={rootCollar}
        material={paint("#c2af69")}
        castShadow
        receiveShadow
        dispose={null}
        scale={[0.85, 1, 0.85]}
      />
      <Curve
        points={[
          [0.02, 0.25, 0.02],
          [-0.05, 0.65, 0.01],
          [0.06, 1.08, -0.02],
          [-0.04, 1.65, -0.05],
        ]}
        radius={0.115}
        tip={0.028}
        color="#a9ad68"
      />
      <group ref={crown} position={[0, 0.4, 0]}>
        <Curve
          points={[
            [0, 0.55, 0],
            [-0.26, 0.92, -0.04],
            [-0.52, 1.25, -0.04],
          ]}
          radius={0.045}
          tip={0.012}
          color="#7e9861"
        />
        <Curve
          points={[
            [0.01, 0.72, 0],
            [0.28, 1.07, -0.03],
            [0.46, 1.48, -0.06],
          ]}
          radius={0.045}
          tip={0.01}
          color="#7e9861"
        />
        <Blade
          position={[-0.17, 0.5, 0.01]}
          rotation={[0.13, -0.25, 0.85]}
          scale={[0.94, 0.93, 0.9]}
          color="#638b5c"
          vein
        />
        <Blade
          position={[0.12, 0.64, -0.025]}
          rotation={[-0.12, 0.2, -1.04]}
          scale={[1, 1.04, 1]}
          color="#809e65"
          vein
        />
        <Blade
          position={[-0.23, 0.9, -0.05]}
          rotation={[0.05, 0.15, 0.49]}
          scale={[0.68, 0.72, 0.8]}
          color="#9cb875"
          vein
        />
        <Blade
          position={[0.2, 1.07, -0.09]}
          rotation={[0.22, 0.45, -0.46]}
          scale={[0.65, 0.8, 0.75]}
          color="#6a955e"
          vein
        />
        <Blade
          position={[-0.035, 1.13, -0.04]}
          rotation={[-0.18, -0.2, 0.1]}
          scale={[0.55, 0.72, 0.8]}
          color="#96b877"
          vein
        />
        {[
          [-0.51, 1.27, 0.01],
          [-0.3, 1.45, 0.025],
          [0.04, 1.42, 0.08],
          [0.46, 1.5, -0.01],
          [0.27, 1.63, -0.07],
        ]
          .slice(0, stage === 1 ? 3 : 5)
          .map((p, i) => (
            <WattleFlower
              key={i}
              position={p as V}
              scale={i % 2 ? 0.88 : 1.05}
            />
          ))}
        {stage >= 2 && (
          <>
            <Curve
              points={[
                [0.01, 0.88, -0.06],
                [-0.19, 1.4, -0.19],
                [-0.28, 1.74, -0.12],
              ]}
              radius={0.032}
              tip={0.009}
              color="#7e9861"
            />
            <WattleFlower position={[-0.28, 1.75, -0.1]} scale={0.95} />
            <Blade
              position={[-0.13, 1.18, -0.2]}
              rotation={[0.4, -0.2, 0.42]}
              scale={[0.65, 0.75, 0.8]}
              color="#83a565"
              vein
            />
          </>
        )}
        {stage === 3 && (
          <>
            <Curve
              points={[
                [0.12, 0.75, -0.13],
                [0.56, 1.03, -0.23],
                [0.72, 1.37, -0.15],
              ]}
              radius={0.045}
              tip={0.01}
              color="#7e9861"
            />
            <Blade
              position={[0.34, 0.89, -0.22]}
              rotation={[0.3, 0.15, -0.79]}
              scale={[0.65, 0.73, 1]}
              color="#8fad68"
              vein
            />
            <WattleFlower position={[0.71, 1.39, -0.12]} />
            <WattleFlower position={[0.61, 1.62, -0.17]} scale={0.84} />
            <Curve
              points={[
                [-0.25, 1, -0.1],
                [-0.55, 1.1, -0.22],
                [-0.71, 1.3, -0.13],
              ]}
              radius={0.03}
              tip={0.01}
              color="#7e9861"
            />
            <WattleFlower position={[-0.71, 1.32, -0.13]} scale={0.9} />
          </>
        )}
      </group>
      <EyePair
        position={[0, 0.68, 0.167]}
        spread={0.095}
        scale={0.75}
        animate={animate}
        seed={2}
      />
      <Curve
        points={[
          [-0.04, 0.53, 0.198],
          [0, 0.513, 0.211],
          [0.035, 0.534, 0.201],
        ]}
        radius={0.008}
        tip={0.008}
        color="#5e704b"
      />
      <Curve
        points={[
          [-0.14, 0.18, 0.12],
          [-0.11, 0.37, 0.16],
          [-0.1, 0.47, 0.16],
        ]}
        radius={0.009}
        tip={0.003}
        color="#b09c5d"
      />
    </group>
  );
}

function Capsule({ ...pose }: Pose) {
  return (
    <group {...pose}>
      <Pebble
        position={[0, 0.02, 0]}
        scale={[0.07, 0.09, 0.07]}
        color="#a09f7b"
      />
      <Pebble
        position={[0, 0.08, 0]}
        scale={[0.077, 0.025, 0.077]}
        color="#bcb59a"
      />
      <Pebble
        position={[0, 0.092, 0]}
        scale={[0.044, 0.009, 0.045]}
        color="#7e886a"
      />
    </group>
  );
}
function Mistleaf({ stage, animate }: { stage: number; animate: boolean }) {
  const canopy = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (canopy.current) {
      canopy.current.rotation.z = animate
        ? Math.sin(clock.elapsedTime * 0.68 + 1) * 0.022
        : 0;
      canopy.current.rotation.y = animate
        ? Math.sin(clock.elapsedTime * 0.47) * 0.022
        : 0;
    }
  });
  return (
    <group scale={stage === 1 ? 0.85 : stage === 2 ? 0.9 : 0.92}>
      <Roots tree stage={stage} animate={animate} />
      <mesh
        geometry={rootCollar}
        material={paint(barkLight)}
        scale={[0.95, 1.05, 0.9]}
        castShadow
        receiveShadow
        dispose={null}
      />
      <Curve
        points={[
          [0, 0.15, 0],
          [-0.04, 0.65, -0.02],
          [0.1, 1.15, -0.045],
          [0.01, 1.78, -0.11],
        ]}
        radius={0.21}
        tip={0.035}
        color={barkLight}
      />
      <Curve
        points={[
          [-0.13, 0.14, 0.12],
          [-0.16, 0.55, 0.115],
          [-0.075, 0.98, 0.087],
          [-0.01, 1.24, 0.023],
        ]}
        radius={0.019}
        tip={0.005}
        color="#a79c80"
      />
      <Curve
        points={[
          [0.12, 0.24, 0.13],
          [0.14, 0.62, 0.115],
          [0.17, 0.96, 0.012],
          [0.11, 1.42, -0.045],
        ]}
        radius={0.024}
        tip={0.006}
        color="#ded0ad"
      />
      <Curve
        points={[
          [0.16, 0.3, -0.11],
          [0.19, 0.69, -0.12],
          [0.15, 1.07, -0.14],
        ]}
        radius={0.022}
        tip={0.005}
        color="#aab2a1"
      />
      <EyePair
        position={[0.015, 0.76, 0.153]}
        spread={0.112}
        scale={0.77}
        animate={animate}
        seed={5}
      />
      <Curve
        points={[
          [-0.025, 0.61, 0.188],
          [0.012, 0.593, 0.192],
          [0.049, 0.614, 0.181],
        ]}
        radius={0.008}
        tip={0.008}
        color="#798273"
      />
      <group ref={canopy} position={[0, 1.03, -0.03]} scale={[0.9, 0.83, 0.9]}>
        <Curve
          points={[
            [0.035, 0, 0],
            [-0.26, 0.35, 0.015],
            [-0.55, 0.72, -0.09],
          ]}
          radius={0.073}
          tip={0.018}
          color={barkLight}
        />
        <Curve
          points={[
            [0.03, 0.2, -0.03],
            [0.31, 0.48, -0.07],
            [0.48, 0.93, -0.15],
          ]}
          radius={0.065}
          tip={0.013}
          color={barkLight}
        />
        <Curve
          points={[
            [0.03, 0.18, -0.07],
            [0.07, 0.69, -0.19],
            [-0.02, 1.02, -0.16],
          ]}
          radius={0.064}
          tip={0.012}
          color={barkLight}
        />
        <Blade
          narrow
          vein
          position={[-0.44, 0.68, -0.07]}
          rotation={[0.15, -0.2, 2.49]}
          scale={[1.3, 0.9, 1.1]}
          color="#739b8c"
        />
        <Blade
          narrow
          vein
          position={[-0.32, 0.46, 0.015]}
          rotation={[-0.2, 0.4, 1.72]}
          scale={[1.12, 0.85, 1.1]}
          color="#a0b9a5"
        />
        <Blade
          narrow
          vein
          position={[0.35, 0.7, -0.1]}
          rotation={[0.14, 0.05, -2.34]}
          scale={[1.35, 0.9, 1]}
          color="#83a895"
        />
        <Blade
          narrow
          vein
          position={[0.44, 0.91, -0.13]}
          rotation={[-0.14, 0.4, -0.84]}
          scale={[1.1, 0.83, 1]}
          color="#a2b8a4"
        />
        <Blade
          narrow
          vein
          position={[-0.01, 0.94, -0.13]}
          rotation={[0.3, 0.2, 0.68]}
          scale={[1.25, 0.73, 1]}
          color="#8fae9b"
        />
        <Blade
          narrow
          vein
          position={[0.015, 0.77, -0.17]}
          rotation={[-0.25, -0.6, -0.43]}
          scale={[1.1, 0.77, 1]}
          color="#6f9788"
        />
        {stage >= 2 && (
          <>
            <Curve
              points={[
                [-0.13, 0.25, -0.08],
                [-0.55, 0.45, -0.3],
                [-0.77, 0.65, -0.24],
              ]}
              radius={0.05}
              tip={0.012}
              color={barkLight}
            />
            <Blade
              narrow
              vein
              position={[-0.72, 0.64, -0.23]}
              rotation={[0.1, 0.4, 2.1]}
              scale={[1.35, 0.86, 1]}
              color="#90b09e"
            />
            <Blade
              narrow
              vein
              position={[-0.62, 0.55, -0.28]}
              rotation={[0.1, -0.3, 0.6]}
              scale={[1.05, 0.67, 1]}
              color="#729a89"
            />
            <Capsule position={[0.27, 0.53, 0.02]} scale={0.9} />
            <Capsule position={[0.38, 0.48, 0.01]} scale={0.7} />
          </>
        )}
        {stage === 3 && (
          <>
            <Curve
              points={[
                [0.15, 0.33, -0.16],
                [0.56, 0.46, -0.36],
                [0.78, 0.82, -0.3],
              ]}
              radius={0.052}
              tip={0.013}
              color={barkLight}
            />
            <Blade
              narrow
              vein
              position={[0.72, 0.78, -0.3]}
              rotation={[0.2, 0.25, -2.48]}
              scale={[1.38, 0.9, 1]}
              color="#789d8c"
            />
            <Blade
              narrow
              vein
              position={[0.73, 0.76, -0.3]}
              rotation={[-0.3, -0.3, -0.66]}
              scale={[1.15, 0.69, 1]}
              color="#a8bcab"
            />
            <Curve
              points={[
                [0.01, 0.74, -0.15],
                [-0.09, 1.03, -0.22],
                [-0.26, 1.2, -0.18],
              ]}
              radius={0.025}
              tip={0.008}
              color={barkLight}
            />
            <Blade
              narrow
              vein
              position={[-0.24, 1.17, -0.16]}
              rotation={[0.1, 0.25, 0.8]}
              scale={[1.15, 0.66, 1]}
              color="#adc1ac"
            />
            <Capsule position={[-0.52, 0.53, -0.13]} />
            <Capsule position={[-0.64, 0.51, -0.1]} scale={0.75} />
          </>
        )}
      </group>
    </group>
  );
}

function InsectWing({
  side,
  hind = false,
  stage,
}: {
  side: number;
  hind?: boolean;
  stage: number;
}) {
  return (
    <group
      rotation={[0.12, side * (hind ? -0.28 : 0.18), side * -1.2]}
      scale={[0.98, (hind ? 0.65 : 0.99) + stage * 0.035, 0.75]}
    >
      <mesh
        geometry={leaf}
        material={wingMaterial}
        castShadow={false}
        dispose={null}
      />
      <Curve
        points={[
          [0, 0, 0.008],
          [0, 0.48, 0.081],
          [0, 0.98, 0.195],
        ]}
        radius={0.008}
        tip={0.003}
        color="#86a89e"
      />
      {[0.3, 0.52, 0.72].map((u, i) => (
        <Curve
          key={u}
          points={[
            [0, u, 0.07],
            [side * 0.12, u + 0.08, 0.067],
            [side * (0.18 - i * 0.035), u + 0.12, 0.055],
          ]}
          radius={0.005}
          tip={0.002}
          color="#a1bcb0"
        />
      ))}
    </group>
  );
}
function Bee({ stage, animate }: { stage: number; animate: boolean }) {
  const hover = useRef<THREE.Group>(null),
    leftWing = useRef<THREE.Group>(null),
    rightWing = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (hover.current) {
      hover.current.position.y = animate
        ? Math.sin(clock.elapsedTime * 2.15) * 0.045
        : 0;
      hover.current.rotation.z = animate
        ? Math.sin(clock.elapsedTime * 0.9) * 0.018
        : 0;
    }
    const flutter = animate ? Math.sin(clock.elapsedTime * 25) * 0.16 : 0;
    if (leftWing.current) leftWing.current.rotation.z = flutter;
    if (rightWing.current) rightWing.current.rotation.z = -flutter;
  });
  const bandColors = ["#75acb5", "#8bc1c4", "#83b7ba", "#a0c8c7", "#82b5b9"];
  return (
    <group ref={hover} scale={stage === 1 ? 0.86 : stage === 2 ? 1 : 1.07}>
      <group
        position={[0, 1.04, -0.39]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.06, 1.31, 1.06]}
      >
        <mesh
          geometry={beeAbdomen}
          material={paint("#2e494d")}
          castShadow
          receiveShadow
          dispose={null}
        />
        {[-0.44, -0.27, -0.08, 0.12, 0.28].map((y, i) => {
          return (
            <mesh
              key={y}
              position={[0, y, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 0.84, 1]}
              geometry={beeBandGeometry[i]}
              material={paint(bandColors[i], 0.84)}
              dispose={null}
            />
          );
        })}
      </group>
      <Pebble
        position={[0, 1.1, 0.15]}
        scale={[0.35, 0.35, 0.33]}
        color="#ba9d61"
      />
      {Array.from({ length: stage === 3 ? 16 : 11 }, (_, i) => {
        const a = i * 2.4,
          y = 0.84 + (i % 4) * 0.13;
        return (
          <Pebble
            key={i}
            position={[Math.cos(a) * 0.3, y, 0.14 + Math.sin(a) * 0.22]}
            scale={[0.09, 0.13, 0.085]}
            color={i % 3 ? "#cfb77b" : "#e0ca92"}
          />
        );
      })}
      <Pebble
        position={[0, 1.28, 0.445]}
        scale={[0.286, 0.271, 0.224]}
        color="#d4b87d"
      />
      <EyePair
        position={[0, 1.3, 0.634]}
        spread={0.13}
        scale={0.77}
        animate={animate}
        seed={3}
      />
      <Curve
        points={[
          [-0.035, 1.155, 0.65],
          [0, 1.14, 0.667],
          [0.035, 1.155, 0.65],
        ]}
        radius={0.008}
        tip={0.008}
        color="#816c44"
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Curve
            points={[
              [s * 0.12, 1.49, 0.47],
              [s * 0.19, 1.7, 0.43],
              [s * 0.22, 1.81, 0.47],
            ]}
            radius={0.023}
            tip={0.015}
            color="#47665d"
          />
          <Pebble
            position={[s * 0.22, 1.81, 0.47]}
            scale={[0.035, 0.047, 0.035]}
            color="#63877a"
          />
          {[0, 1, 2].map((j) => (
            <group key={j}>
              <Curve
                points={[
                  [s * 0.24, 1.04 - j * 0.06, 0.25 - j * 0.23],
                  [s * (0.48 + j * 0.035), 0.77, 0.26 - j * 0.25],
                  [s * (0.5 + j * 0.04), 0.51 - j * 0.025, 0.38 - j * 0.31],
                  [s * (0.55 + j * 0.04), 0.47 - j * 0.025, 0.42 - j * 0.31],
                ]}
                radius={0.029}
                tip={0.009}
                color="#52665c"
              />
              {j === 2 && stage >= 2 && (
                <Pebble
                  position={[s * 0.55, 0.66, -0.31]}
                  scale={[0.06, 0.095, 0.048]}
                  color="#e8ca6c"
                />
              )}
            </group>
          ))}
        </group>
      ))}
      <group ref={leftWing} position={[-0.19, 1.28, -0.06]}>
        <InsectWing side={-1} stage={stage} />
        <group position={[0.01, -0.03, -0.12]}>
          <InsectWing side={-1} stage={stage} hind />
        </group>
      </group>
      <group ref={rightWing} position={[0.19, 1.28, -0.06]}>
        <InsectWing side={1} stage={stage} />
        <group position={[-0.01, -0.03, -0.12]}>
          <InsectWing side={1} stage={stage} hind />
        </group>
      </group>
    </group>
  );
}

function BirdFoot({ side, kook = false }: { side: number; kook?: boolean }) {
  return (
    <group position={[side * 0.185, 0.025, 0.1]}>
      <Curve
        points={[
          [0, 0.27, -0.01],
          [0.02 * side, 0.14, 0],
          [0, 0.028, 0.02],
        ]}
        radius={kook ? 0.037 : 0.029}
        tip={0.022}
        color="#9f805b"
      />
      {[-1, 0, 1].map((i) => (
        <Curve
          key={i}
          points={[
            [0, 0.039, 0.015],
            [i * 0.055, 0.026, 0.125],
            [i * 0.07, 0.018, 0.22 - Math.abs(i) * 0.03],
          ]}
          radius={0.023}
          tip={0.007}
          color="#b9986a"
        />
      ))}
      <Curve
        points={[
          [0, 0.045, 0.01],
          [0.015, 0.029, -0.1],
          [0.028, 0.018, -0.14],
        ]}
        radius={0.02}
        tip={0.006}
        color="#a98a61"
      />
    </group>
  );
}
function FoldedWing({
  side,
  id,
  stage,
  animate,
}: {
  side: number;
  id: number;
  stage: number;
  animate: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (root.current)
      root.current.rotation.z =
        -side * 0.12 +
        (animate ? Math.sin(clock.elapsedTime * 1.1 + id) * 0.018 : 0);
  });
  const color = id === 0 ? "#4b8971" : id === 1 ? "#44808d" : "#8f7f66";
  return (
    <group
      ref={root}
      position={[side * (id === 1 ? 0.29 : 0.35), 0.94, -0.02]}
      rotation={[0.16, side * -0.24, -side * 0.12]}
    >
      <Blade
        feather
        color={color}
        position={[0, 0.07, 0]}
        rotation={[Math.PI, 0, side * 0.12]}
        scale={[0.95, 0.81, 1.15]}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Blade
          feather
          key={i}
          color={
            id === 0
              ? ["#75a781", "#4e8f75", "#2f755f", "#7caa8a", "#b5c99a"][i]
              : id === 1
                ? ["#6a9da5", "#478897", "#326c81", "#85b7ba", "#b9d4c6"][i]
                : ["#c0aa82", "#9c8a6b", "#ad9975", "#779a96", "#d5c59e"][i]
          }
          position={[
            side * (0.02 + i * 0.015),
            -0.12 - i * 0.025,
            0.1 + i * 0.036,
          ]}
          rotation={[Math.PI + 0.1, side * 0.1, side * (0.05 + i * 0.07)]}
          scale={[0.28, 0.53 + (i % 2) * 0.07 + stage * 0.025, 0.7]}
        />
      ))}
    </group>
  );
}
function Beak({ id }: { id: number }) {
  if (id === 0)
    return (
      <group position={[0, 1.33, 0.477]} scale={0.8}>
        <Curve
          points={[
            [0, 0.08, 0],
            [0, 0.035, 0.14],
            [0, -0.065, 0.17],
            [0, -0.12, 0.11],
          ]}
          radius={0.112}
          tip={0.025}
          color="#de9f53"
        />
        <Pebble
          position={[0, -0.08, 0.07]}
          scale={[0.077, 0.055, 0.08]}
          color="#ad743f"
        />
        <Pebble
          position={[-0.035, 0.066, 0.09]}
          scale={[0.02, 0.012, 0.011]}
          color="#83683e"
        />
      </group>
    );
  if (id === 1)
    return (
      <Curve
        position={[0, 1.29, 0.42]}
        points={[
          [0, 0.025, 0],
          [0, 0.005, 0.12],
          [0, -0.005, 0.23],
        ]}
        radius={0.055}
        tip={0.004}
        color="#495d56"
      />
    );
  return (
    <group position={[0, 1.33, 0.44]}>
      <Curve
        points={[
          [0, 0.025, 0],
          [0, 0.005, 0.23],
          [0, -0.015, 0.45],
        ]}
        radius={0.12}
        tip={0.012}
        color="#b8a579"
      />
      <Curve
        points={[
          [0, -0.027, 0.07],
          [0, -0.04, 0.24],
          [0, -0.019, 0.436],
        ]}
        radius={0.052}
        tip={0.003}
        color="#8e805e"
      />
    </group>
  );
}
function Bird({
  id,
  stage,
  animate,
}: {
  id: number;
  stage: number;
  animate: boolean;
}) {
  const head = useRef<THREE.Group>(null),
    tail = useRef<THREE.Group>(null);
  const wren = id === 1,
    kook = id === 4;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (head.current) {
      head.current.rotation.y = animate ? Math.sin(t * 0.53 + id) * 0.045 : 0;
      head.current.rotation.z = animate ? Math.sin(t * 0.8 + id) * 0.018 : 0;
    }
    if (tail.current)
      tail.current.rotation.z = animate
        ? Math.sin(t * (wren ? 1.9 : 0.8)) * (wren ? 0.035 : 0.017)
        : 0;
  });
  const bodyColor = id === 0 ? "#568c68" : wren ? "#789c9d" : "#aa9370";
  return (
    <group scale={stage === 1 ? 0.91 : stage === 2 ? 1 : 1.07}>
      <BirdFoot side={-1} kook={kook} />
      <BirdFoot side={1} kook={kook} />
      <group ref={tail} position={[0, wren ? 0.46 : 0.7, -0.3]}>
        {Array.from({ length: stage === 3 ? 5 : 3 }, (_, i) => {
          const n = stage === 3 ? 5 : 3,
            offset = i - (n - 1) / 2;
          return (
            <Blade
              feather
              key={i}
              position={[offset * 0.085, 0, 0]}
              rotation={[wren ? -0.49 : -1.92, offset * 0.14, offset * -0.055]}
              scale={[
                wren ? 0.28 : 0.44,
                wren ? 0.91 + stage * 0.12 : kook ? 0.85 : 0.91 + stage * 0.06,
                1,
              ]}
              color={
                id === 0
                  ? ["#d4b46e", "#638d86", "#83ae9b", "#b0a2ba", "#d4b46e"][i]
                  : wren
                    ? i % 2
                      ? "#3d738d"
                      : "#56869c"
                    : i % 2
                      ? "#bdab8c"
                      : "#766c57"
              }
            />
          );
        })}
        {kook &&
          [0, 1, 2].map((i) => (
            <Curve
              key={i}
              points={[
                [-0.14, -0.2 - i * 0.16, -0.12 - i * 0.08],
                [0, -0.2 - i * 0.16, -0.12 - i * 0.08],
                [0.14, -0.2 - i * 0.16, -0.12 - i * 0.08],
              ]}
              radius={0.024}
              tip={0.019}
              color="#675e4d"
            />
          ))}
      </group>
      <mesh
        position={[0, 0.24, 0]}
        geometry={wren ? wrenBody : kook ? kookBody : birdBody}
        material={paint(bodyColor)}
        castShadow
        receiveShadow
        dispose={null}
      />
      <mesh
        position={[0, 0.24, 0]}
        geometry={wren ? wrenChest : kook ? kookChest : parrotChest}
        material={paint(id === 0 ? "#d9b866" : wren ? "#d3d9bb" : "#e0d3af")}
        castShadow
        dispose={null}
      />
      {id === 0 && (
        <>
          <mesh
            position={[0, 0.24, 0]}
            geometry={parrotBib}
            material={paint("#d88f52")}
            castShadow
            dispose={null}
          />
          <mesh
            position={[0, 0.24, 0]}
            geometry={parrotCollar}
            material={paint("#e6bf71")}
            castShadow
            dispose={null}
          />
        </>
      )}
      {kook &&
        [-1, 0, 1].map((i) => (
          <Curve
            key={i}
            points={[
              [i * 0.1, 0.43, 0.365],
              [i * 0.105, 0.6, 0.405],
              [i * 0.08, 0.82, 0.389],
            ]}
            radius={0.012}
            tip={0.008}
            color="#bba98b"
          />
        ))}
      <FoldedWing side={-1} id={id} stage={stage} animate={animate} />
      <FoldedWing side={1} id={id} stage={stage} animate={animate} />
      <group ref={head}>
        <mesh
          position={[0, 1.39, 0.1]}
          geometry={parrotHead}
          material={paint(id === 0 ? "#708ea0" : wren ? "#6ca6bd" : "#d9cba5")}
          scale={kook ? [1.2, 1, 1.03] : wren ? [0.84, 0.86, 0.88] : [1, 1, 1]}
          castShadow
          receiveShadow
          dispose={null}
        />
        {wren && (
          <>
            <Pebble
              position={[-0.23, 1.39, 0.34]}
              scale={[0.13, 0.12, 0.06]}
              color="#325a69"
            />
            <Pebble
              position={[0.23, 1.39, 0.34]}
              scale={[0.13, 0.12, 0.06]}
              color="#325a69"
            />
          </>
        )}
        {kook &&
          [-1, 1].map((s) => (
            <Pebble
              key={s}
              position={[s * 0.25, 1.4, 0.389]}
              scale={[0.195, 0.075, 0.027]}
              rotation={[0, s * 0.22, s * 0.07]}
              color="#796b53"
            />
          ))}
        <EyePair
          position={[
            0,
            kook ? 1.425 : wren ? 1.4 : 1.43,
            kook ? 0.438 : wren ? 0.389 : 0.417,
          ]}
          spread={kook ? 0.225 : wren ? 0.14 : 0.17}
          scale={wren ? 0.82 : 0.9}
          animate={animate}
          seed={id}
        />
        {id === 0 && (
          <>
            <Blade
              feather
              position={[-0.09, 1.68, 0.015]}
              rotation={[0.23, -0.2, 0.5]}
              scale={[0.4, 0.2 + stage * 0.025, 1]}
              color="#8199ba"
            />
            <Blade
              feather
              position={[0.03, 1.72, -0.025]}
              rotation={[0.14, 0.2, -0.12]}
              scale={[0.4, 0.23 + stage * 0.025, 1]}
              color="#a79ac6"
            />
            {stage >= 2 && (
              <Blade
                feather
                position={[0.15, 1.65, -0.04]}
                rotation={[0.23, 0.2, -0.6]}
                scale={[0.35, 0.22, 1]}
                color="#bcb095"
              />
            )}
          </>
        )}
        {kook &&
          [0, 1, 2].map((i) => (
            <Blade
              feather
              key={i}
              position={[(i - 1) * 0.13, 1.69, -0.09]}
              rotation={[-0.3, 0, (i - 1) * -0.3]}
              scale={[0.35, 0.23 + stage * 0.035, 1]}
              color={i % 2 ? "#b3a383" : "#cbbb94"}
            />
          ))}
        {wren && (
          <Blade
            feather
            position={[0, 1.67, 0.04]}
            rotation={[0.25, 0.3, -0.3]}
            scale={[0.62, 0.19 + stage * 0.025, 1]}
            color="#8ab8c5"
          />
        )}
        <Beak id={id} />
        {stage === 3 && id === 0 && (
          <Blade
            feather
            position={[-0.2, 1.67, -0.07]}
            rotation={[0.15, 0.1, 0.8]}
            scale={[0.32, 0.2, 1]}
            color="#c4b677"
          />
        )}
        {stage >= 2 &&
          wren &&
          [-1, 1].map((s) => (
            <Blade
              feather
              key={s}
              position={[s * 0.23, 1.56, 0.09]}
              rotation={[0.2, s * 0.5, -s * 0.8]}
              scale={[0.3, 0.28 + stage * 0.04, 1]}
              color="#92c3c6"
            />
          ))}
      </group>
    </group>
  );
}

export function CharacterModel({
  id,
  stage = 1,
  animate = true,
  onSelect,
}: ModelProps) {
  const safeStage = Math.min(3, Math.max(1, stage));
  return (
    <group
      name={`companion-${id}-stage-${safeStage}`}
      onClick={(e) => {
        if (e.delta > 5) return;
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {id === 2 ? (
        <Wattle stage={safeStage} animate={animate} />
      ) : id === 5 ? (
        <Mistleaf stage={safeStage} animate={animate} />
      ) : id === 3 ? (
        <Bee stage={safeStage} animate={animate} />
      ) : (
        <Bird id={id} stage={safeStage} animate={animate} />
      )}
    </group>
  );
}
