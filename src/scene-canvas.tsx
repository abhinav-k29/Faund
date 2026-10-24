import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "./scene";
import { CharacterModel } from "./companion-models";
export { CharacterModel } from "./companion-models";
type Vec = [number, number, number];

type EnvironmentKind = "canopy" | "detail" | "stem";
type EnvironmentInstance = { position: Vec; scale: Vec; rotation: Vec };
type EnvironmentBatch = {
  kind: EnvironmentKind;
  color: string;
  instances: EnvironmentInstance[];
};

// Three shared shapes replace the former geometry/material allocation per
// petal, reed, tree crown and stone. Small petals/stones need fewer segments
// than the larger hills/canopies, without changing their silhouettes/positions.
const environmentGeometry = {
  canopy: new THREE.SphereGeometry(1, 24, 16),
  detail: new THREE.SphereGeometry(1, 12, 8),
  stem: new THREE.CylinderGeometry(1, 1, 1, 12),
};
const environmentMaterials = new Map<string, THREE.MeshStandardMaterial>();
function environmentMaterial(kind: EnvironmentKind, color: string) {
  const key = `${kind === "stem" ? "stem" : "orb"}:${color}`;
  if (!environmentMaterials.has(key))
    environmentMaterials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: kind === "stem" ? 0.85 : 0.76,
      }),
    );
  return environmentMaterials.get(key)!;
}
function EnvironmentInstances({ batch }: { batch: EnvironmentBatch }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const transform = new THREE.Object3D();
    batch.instances.forEach((instance, i) => {
      transform.position.set(...instance.position);
      transform.scale.set(...instance.scale);
      transform.rotation.set(...instance.rotation);
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidate();
    // Shared shape/material resources live for the module. Instance matrices
    // belong to this batch and are explicitly released when it is replaced.
    return () => mesh.dispose();
  }, [batch, invalidate]);
  return (
    <group dispose={null}>
      <instancedMesh
        ref={ref}
        args={[
          environmentGeometry[batch.kind],
          environmentMaterial(batch.kind, batch.color),
          batch.instances.length,
        ]}
        castShadow
        receiveShadow={batch.kind !== "stem"}
      />
    </group>
  );
}
function buildHabitatBatches(biome: string, rich: boolean) {
  const wet = biome === "wetland",
    batches = new Map<string, EnvironmentBatch>();
  const add = (
    kind: EnvironmentKind,
    color: string,
    position: Vec,
    scale: Vec | number,
    rotation: Vec = [0, 0, 0],
  ) => {
    const key = `${kind}:${color}`;
    if (!batches.has(key)) batches.set(key, { kind, color, instances: [] });
    batches.get(key)!.instances.push({
      position,
      scale: typeof scale === "number" ? [scale, scale, scale] : scale,
      rotation,
    });
  };
  add("canopy", "#9cb78d", [-1.2, 0.02, -1.7], [1.7, 0.22, 1.3]);
  add("canopy", "#aac298", [1.4, 0.03, -1.9], [1.5, 0.3, 1.2]);
  const trees: Vec[] =
    biome === "woodland"
      ? [
          [-2.2, 0, -1.7],
          [1.8, 0, -2],
          [-2.7, 0, 0.5],
          [2.7, 0, 0.1],
        ]
      : wet
        ? [
            [-2.3, 0, -1.6],
            [2.1, 0, -2],
          ]
        : [
            [-2.6, 0, -1.7],
            [2.5, 0, -2],
          ];
  trees.slice(0, rich ? 4 : 1).forEach(([x, y, z], i) => {
    const s = 0.65 + (i % 2) * 0.15;
    add("stem", "#9b8564", [x, y + 0.58 * s, z], [0.16 * s, 1.2 * s, 0.16 * s]);
    add(
      "canopy",
      "#729783",
      [x, y + 1.5 * s, z],
      [0.65 * s, 0.95 * s, 0.65 * s],
    );
    add(
      "canopy",
      "#8bad8c",
      [x - 0.38 * s, y + 1.27 * s, z + 0.12 * s],
      0.5 * s,
    );
    add(
      "canopy",
      "#7a9f80",
      [x + 0.34 * s, y + 1.42 * s, z + 0.09 * s],
      0.52 * s,
    );
  });
  Array.from({ length: rich ? (biome === "meadow" ? 16 : 9) : 3 }, (_, i) => {
    const a = i * 2.399,
      r = 2.4 + (i % 3) * 0.15,
      x = Math.sin(a) * r,
      z = Math.cos(a) * r;
    if (wet) {
      add("stem", "#709477", [x, 0.3, z], [0.025, 0.6, 0.025]);
      add("detail", "#9d9271", [x, 0.57, z], [0.06, 0.17, 0.05]);
    } else {
      add("stem", "#68916c", [x, 0.19, z], [0.018, 0.3, 0.018]);
      const color = i % 3 === 0 ? "#c7b5d9" : i % 2 ? "#e9c878" : "#ecc2a0";
      for (let petal = 0; petal < 5; petal++)
        add(
          "detail",
          color,
          [
            x + Math.sin(petal * 1.26) * 0.09,
            0.37,
            z + Math.cos(petal * 1.26) * 0.09,
          ],
          0.07,
        );
      add("detail", "#e1bc56", [x, 0.39, z], 0.055);
    }
  });
  const stones: Vec[] = [
    [-2.8, 0, 1.4],
    [2.5, 0, 1.6],
    [1.7, 0, -2.7],
  ];
  stones.forEach((position) =>
    add("detail", "#b3b5a2", position, [0.3, 0.18, 0.25]),
  );
  if (biome === "woodland")
    add(
      "stem",
      "#a38e6c",
      [1.5, 0.12, 1.5],
      [0.2, 1.3, 0.2],
      [0, 0, Math.PI / 2],
    );
  return [...batches.entries()];
}
function Habitat({ biome, richness }: { biome: string; richness: number }) {
  const wet = biome === "wetland",
    rich = richness > 0;
  const batches = useMemo(
    () => buildHabitatBatches(biome, rich),
    [biome, rich],
  );
  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[3.9, 3.6, 0.4, 64]} />
        <meshStandardMaterial
          color={wet ? "#839e91" : biome === "woodland" ? "#95ad80" : "#a7be89"}
          roughness={1}
        />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[3.6, 3.3, 0.25, 64]} />
        <meshStandardMaterial color="#b8ab8b" roughness={1} />
      </mesh>
      {wet && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0.1, 0.025, 0.6]}
          scale={[1.5, 1, 1]}
        >
          <circleGeometry args={[1.1, 48]} />
          <meshStandardMaterial
            color="#83b8bb"
            roughness={0.3}
            metalness={0.08}
          />
        </mesh>
      )}
      {batches.map(([key, batch]) => (
        <EnvironmentInstances key={key} batch={batch} />
      ))}
    </group>
  );
}
function CameraReset({ mode, reset }: { mode: string; reset: number }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    camera.position.set(
      ...((mode === "world" ? [5.3, 4.6, 7] : [3, 2.5, 4.7]) as [
        number,
        number,
        number,
      ]),
    );
    camera.lookAt(0, mode === "world" ? 0.5 : 1, 0);
    invalidate();
  }, [mode, reset, camera, invalidate]);
  return null;
}
function SceneContent({
  characters,
  biome = "meadow",
  mode = "character",
  onSelect,
  reduced,
  reset,
  quality = "balanced",
  cameraCommand,
}: SceneProps & { reduced: boolean; reset: number }) {
  const controls = useRef<any>(null);
  const { camera, invalidate } = useThree();
  useEffect(() => {
    if (!cameraCommand || !controls.current) return;
    const target = controls.current.target as THREE.Vector3;
    const offset = camera.position.clone().sub(target);
    const action = cameraCommand.action;
    if (action === "left" || action === "right") {
      offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        action === "left" ? Math.PI / 8 : -Math.PI / 8,
      );
    } else {
      const distance = THREE.MathUtils.clamp(
        offset.length() * (action === "in" ? 0.84 : 1.19),
        mode === "world" ? 5.3 : 3.2,
        mode === "world" ? 13 : 6.5,
      );
      offset.setLength(distance);
    }
    camera.position.copy(target).add(offset);
    controls.current.update();
    invalidate();
  }, [cameraCommand, mode, camera, invalidate]);
  const placements: Vec[] = [
    [-1.1, 0, 0.5],
    [1.05, 0, 0.05],
    [0, 0, -1.2],
    [-1.9, 0, -0.6],
    [1.9, 0, -0.9],
    [0, 0, 1.8],
  ];
  return (
    <>
      <CameraReset mode={mode} reset={reset} />
      <ambientLight intensity={0.68} />
      <hemisphereLight args={["#e7f0ef", "#8a9777", 1.45]} />
      <directionalLight
        position={[-3, 7, 6]}
        color="#fff1d3"
        intensity={1.8}
        castShadow={quality !== "low"}
        shadow-mapSize={[768, 768]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-radius={3}
        shadow-blurSamples={6}
      />
      <directionalLight
        position={[4, 3, -3]}
        color="#c4dbe2"
        intensity={0.75}
      />
      {mode === "world" ? (
        <>
          <Habitat biome={biome} richness={characters.length} />
          {characters.map((c, i) => (
            <group
              key={c.id}
              position={placements[i % placements.length]}
              rotation={[0, 0.2 - i * 0.15, 0]}
              scale={0.84}
            >
              <CharacterModel
                id={c.id}
                stage={c.stage}
                animate={!reduced}
                onSelect={() => onSelect?.(c.id)}
              />
            </group>
          ))}
        </>
      ) : (
        <>
          <mesh position={[0, -0.05, 0]} receiveShadow>
            <cylinderGeometry args={[1.45, 1.5, 0.15, 64]} />
            <meshStandardMaterial color="#e4dac3" roughness={0.9} />
          </mesh>
          {characters[0] && (
            <group
              rotation={[
                0,
                characters[0].id === 2 || characters[0].id === 5 ? 0.2 : -0.15,
                0,
              ]}
            >
              <CharacterModel
                id={characters[0].id}
                stage={characters[0].stage}
                animate={!reduced}
              />
            </group>
          )}
        </>
      )}
      <OrbitControls
        key={reset}
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={mode === "world" ? 5.3 : 3.2}
        maxDistance={mode === "world" ? 13 : 6.5}
        minPolarAngle={0.45}
        maxPolarAngle={1.45}
        target={mode === "world" ? [0, 0.5, 0] : [0, 1, 0]}
      />
    </>
  );
}
function RenderProbe({
  host,
  reduced,
  visible,
}: {
  host: { current: HTMLDivElement | null };
  reduced: boolean;
  visible: boolean;
}) {
  const { gl } = useThree();
  const samples = useRef({ total: 0, count: 0, long: 0, skipNext: true });
  useEffect(() => {
    // A resumed clock includes its hidden/paused interval; exclude that one
    // transition frame, then retain every positive visible-frame interval.
    samples.current = { total: 0, count: 0, long: 0, skipNext: true };
  }, [visible, reduced]);
  useFrame((_, delta) => {
    if (reduced || !visible) return;
    if (samples.current.skipNext) {
      samples.current.skipNext = false;
      return;
    }
    if (delta <= 0) return;
    samples.current.total += delta * 1000;
    samples.current.count++;
    if (delta > 0.05) samples.current.long++;
  });
  useEffect(() => {
    const report = () => {
      const el = host.current;
      if (!el) return;
      el.dataset.drawCalls = String(gl.info.render.calls);
      el.dataset.triangles = String(gl.info.render.triangles);
      el.dataset.geometries = String(gl.info.memory.geometries);
      el.dataset.textures = String(gl.info.memory.textures);
      // Frame interval is diagnostic, not a claim about GPU rendering time.
      el.dataset.frameMs =
        reduced || !visible || !samples.current.count
          ? "0"
          : (samples.current.total / samples.current.count).toFixed(2);
      el.dataset.frameSamples = String(samples.current.count);
      el.dataset.longFrames = String(samples.current.long);
      samples.current = {
        total: 0,
        count: 0,
        long: 0,
        skipNext: samples.current.skipNext,
      };
    };
    const first = setTimeout(report, 200),
      timer = setInterval(report, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [gl, host, reduced, visible]);
  return null;
}
export default function SceneCanvas(
  props: SceneProps & { visible: boolean; reduced: boolean; reset: number },
) {
  const [ready, setReady] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const removeContextListener = useRef<(() => void) | null>(null);
  const unavailable = useRef(props.onUnavailable);
  unavailable.current = props.onUnavailable;
  useEffect(() => () => removeContextListener.current?.(), []);
  return (
    <div
      className="scene-canvas"
      ref={host}
      data-scene-ready={ready}
      data-character-count={props.characters.length}
      data-stages={props.characters.map((c) => c.stage).join(",")}
      data-render-mode={
        !props.visible ? "never" : props.reduced ? "demand" : "always"
      }
    >
      <Canvas
        shadows={props.quality !== "low"}
        dpr={props.quality === "low" ? 1 : [1, 1.5]}
        camera={{
          position: props.mode === "world" ? [5.3, 4.6, 7] : [3, 2.5, 4.7],
          fov: props.mode === "world" ? 38 : 35,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
          preserveDrawingBuffer: true,
        }}
        frameloop={
          !props.visible ? "never" : props.reduced ? "demand" : "always"
        }
        onCreated={({ gl }) => {
          gl.setClearColor(props.mode === "world" ? "#dce7d4" : "#eee8df", 1);
          gl.shadowMap.type = THREE.VSMShadowMap;
          const lost = (event: Event) => {
            event.preventDefault();
            unavailable.current?.();
          };
          gl.domElement.addEventListener("webglcontextlost", lost, false);
          removeContextListener.current = () =>
            gl.domElement.removeEventListener("webglcontextlost", lost, false);
          setReady(true);
        }}
      >
        <SceneContent {...props} />
        <RenderProbe
          host={host}
          reduced={props.reduced}
          visible={props.visible}
        />
      </Canvas>
    </div>
  );
}
