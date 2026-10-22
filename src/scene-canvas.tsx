import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "./scene";
type Vec = [number, number, number];
function Orb({
  position = [0, 0, 0],
  scale = 1,
  color,
  rotation = [0, 0, 0],
  opacity = 1,
}: {
  position?: Vec;
  scale?: Vec | number;
  color: string;
  rotation?: Vec;
  opacity?: number;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.76}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
function Stem({
  position,
  scale,
  color = "#68916c",
  rotation = [0, 0, 0],
}: {
  position: Vec;
  scale: Vec;
  color?: string;
  rotation?: Vec;
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <cylinderGeometry args={[1, 1, 1, 12]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
function Eyes({
  y = 1.4,
  z = 0.48,
  spread = 0.19,
}: {
  y?: number;
  z?: number;
  spread?: number;
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Orb
            position={[side * spread, y, z]}
            scale={[0.12, 0.15, 0.075]}
            color="#fdf8e9"
          />
          <Orb
            position={[side * spread + 0.015, y - 0.015, z + 0.06]}
            scale={[0.068, 0.095, 0.045]}
            color="#173c38"
          />
          <Orb
            position={[side * spread + 0.035, y + 0.035, z + 0.095]}
            scale={0.025}
            color="#ffffff"
          />
          <Orb
            position={[side * (spread + 0.12), y - 0.18, z - 0.025]}
            scale={[0.12, 0.055, 0.035]}
            color="#e6a88d"
          />
        </group>
      ))}
    </>
  );
}
function LeafMesh({
  position,
  rotation = [0, 0, 0],
  scale = [0.18, 0.5, 0.1],
  color = "#75a57a",
}: {
  position: Vec;
  rotation?: Vec;
  scale?: Vec;
  color?: string;
}) {
  return (
    <Orb position={position} scale={scale} rotation={rotation} color={color} />
  );
}
export function CharacterModel({
  id,
  stage = 1,
  animate = true,
  onSelect,
}: {
  id: number;
  stage?: number;
  animate?: boolean;
  onSelect?: () => void;
}) {
  const body = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!animate || !body.current) return;
    const t = clock.elapsedTime + id;
    body.current.position.y =
      (id === 3 ? 0.25 : 0.03) +
      Math.sin(t * (id === 3 ? 2 : 1.5)) * (id === 3 ? 0.08 : 0.025);
    body.current.rotation.z = Math.sin(t) * 0.025;
    if (left.current && right.current) {
      const flap = Math.sin(t * (id === 3 ? 13 : 2)) * (id === 3 ? 0.3 : 0.08);
      left.current.rotation.z = flap;
      right.current.rotation.z = -flap;
    }
  });
  const plant = id === 2 || id === 5;
  const bee = id === 3;
  const wren = id === 1;
  const kook = id === 4;
  const bodyColor =
    id === 0
      ? "#6fa68c"
      : wren
        ? "#79b9cc"
        : kook
          ? "#bc9974"
          : id === 5
            ? "#9fb7ae"
            : "#dfc576";
  return (
    <group
      onClick={(e) => {
        if (e.delta > 5) return;
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <group ref={body} scale={stage === 1 ? 0.86 : stage === 2 ? 1 : 1.12}>
        {bee ? (
          <>
            <Orb
              position={[0, 0.95, -0.1]}
              scale={[0.55, 0.5, 0.68]}
              color="#b1d7d4"
            />
            {[-0.4, -0.1, 0.2].map((z) => (
              <mesh position={[0, 0.95, z]} key={z}>
                <torusGeometry args={[0.5, 0.055, 10, 28]} />
                <meshStandardMaterial color="#4a7384" roughness={0.85} />
              </mesh>
            ))}
            <Orb
              position={[0, 1.32, 0.45]}
              scale={[0.43, 0.39, 0.33]}
              color="#d9b179"
            />
            <Eyes y={1.37} z={0.735} spread={0.17} />
            {[-1, 1].map((side) => (
              <group key={side}>
                <Stem
                  position={[side * 0.2, 1.81, 0.4]}
                  scale={[0.025, 0.35, 0.025]}
                  rotation={[0, 0, -side * 0.3]}
                  color="#486a60"
                />
                <Orb
                  position={[side * 0.25, 1.99, 0.4]}
                  scale={0.06}
                  color="#698f91"
                />
                {[0, 1].map((j) => (
                  <Stem
                    key={j}
                    position={[side * 0.44, 0.62 + j * 0.09, 0.1 - j * 0.5]}
                    scale={[0.025, 0.35, 0.025]}
                    rotation={[0, 0, side * 0.8]}
                    color="#547770"
                  />
                ))}
              </group>
            ))}
            <group ref={left} position={[-0.35, 1.27, -0.1]}>
              <Orb
                position={[-0.4, 0.05, -0.03]}
                scale={[0.6, 0.045, 0.32]}
                rotation={[0, -0.3, 0.15]}
                color="#e6f8ee"
                opacity={0.75}
              />
            </group>
            <group ref={right} position={[0.35, 1.27, -0.1]}>
              <Orb
                position={[0.4, 0.05, -0.03]}
                scale={[0.6, 0.045, 0.32]}
                rotation={[0, 0.3, -0.15]}
                color="#e6f8ee"
                opacity={0.75}
              />
            </group>
            {stage >= 2 && (
              <LeafMesh
                position={[0, 1, -0.86]}
                rotation={[0.6, 0, 0]}
                scale={[0.18, 0.38, 0.12]}
                color="#7aa79b"
              />
            )}
            {stage === 3 && (
              <>
                {[-1, 1].map((side) => (
                  <Orb
                    key={side}
                    position={[side * 0.46, 1.6, -0.12]}
                    scale={[0.4, 0.035, 0.23]}
                    rotation={[0, side * 0.4, side * 0.25]}
                    color="#c8e7ec"
                    opacity={0.7}
                  />
                ))}
                <Orb position={[0, 1.97, 0.43]} scale={0.12} color="#eacf7e" />
              </>
            )}
          </>
        ) : plant ? (
          <>
            <Orb
              position={[0, 0.78, 0]}
              scale={id === 5 ? [0.38, 0.7, 0.34] : [0.52, 0.62, 0.42]}
              color={bodyColor}
            />
            <Orb
              position={[0, 1.38, 0.12]}
              scale={[0.5, 0.46, 0.38]}
              color={id === 5 ? "#bacfc3" : "#f0da8f"}
            />
            <Orb
              position={[0, 0.7, 0.32]}
              scale={[0.32, 0.4, 0.18]}
              color="#f4e7b3"
            />
            <Eyes y={1.41} z={0.46} />
            <Stem
              position={[0, 1.99, 0]}
              scale={[0.045, 0.5, 0.045]}
              color="#66875b"
            />
            {[-1, 1].map((side) => (
              <group key={side}>
                <LeafMesh
                  position={[side * 0.62, 1.3, 0]}
                  rotation={[0, 0, -side * 0.85]}
                  scale={[0.2, 0.57, 0.12]}
                  color={id === 5 ? "#74a397" : "#76a66e"}
                />
                <Orb
                  position={[side * 0.23, 0.17, 0.08]}
                  scale={[0.18, 0.12, 0.25]}
                  color="#6f8b67"
                />
                <LeafMesh
                  position={[side * 0.2, 2.05, 0]}
                  rotation={[0, 0, -side * 0.8]}
                  scale={[0.15, 0.42, 0.08]}
                  color="#7d9d69"
                />
              </group>
            ))}
            {(id === 2
              ? [
                  [-0.35, 1.89, 0.02],
                  [0, 2.13, 0.05],
                  [0.35, 1.89, 0.02],
                ]
              : [
                  [-0.16, 2, 0.08],
                  [0.2, 2.1, 0.02],
                ]
            ).map((p, i) => (
              <group key={i} position={p as Vec}>
                <Orb
                  scale={id === 2 ? 0.18 : 0.105}
                  color={id === 2 ? "#e6c855" : "#e6d8a4"}
                />
                {id === 2 &&
                  [0, 1, 2].map((a) => (
                    <Orb
                      key={a}
                      position={[
                        Math.sin(a * 2.1) * 0.14,
                        Math.cos(a * 2.1) * 0.14,
                        0.02,
                      ]}
                      scale={0.1}
                      color="#f2d774"
                    />
                  ))}
              </group>
            ))}
            {stage >= 2 && (
              <>
                {[-1, 1].map((side) => (
                  <LeafMesh
                    key={side}
                    position={[side * 0.38, 0.8, -0.3]}
                    rotation={[0.4, 0, -side * 0.8]}
                    scale={[0.2, 0.6, 0.12]}
                    color="#80aa75"
                  />
                ))}
              </>
            )}
            {stage === 3 && (
              <>
                {[-1, 1].map((side) => (
                  <group key={side}>
                    <Stem
                      position={[side * 0.4, 1.9, -0.15]}
                      scale={[0.025, 0.6, 0.025]}
                      rotation={[0, 0, -side * 0.5]}
                    />
                    <Orb
                      position={[side * 0.54, 2.15, -0.15]}
                      scale={0.17}
                      color="#edcc6a"
                    />
                  </group>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <Orb
              position={[0, 0.75, 0]}
              scale={kook ? [0.56, 0.6, 0.46] : [0.48, 0.6, 0.4]}
              color={bodyColor}
            />
            <Orb
              position={[0, 0.72, 0.32]}
              scale={[0.34, 0.44, 0.15]}
              color={id === 0 ? "#efc584" : kook ? "#eee0ba" : "#d3e9dc"}
            />
            <Orb
              position={[0, 1.38, 0.06]}
              scale={
                kook
                  ? [0.59, 0.46, 0.43]
                  : wren
                    ? [0.43, 0.43, 0.36]
                    : [0.49, 0.48, 0.4]
              }
              color={id === 0 ? "#7f9fad" : kook ? "#e6d8b6" : "#7ab6d2"}
            />
            {kook && (
              <>
                {[-1, 1].map((side) => (
                  <Orb
                    key={side}
                    position={[side * 0.3, 1.4, 0.39]}
                    scale={[0.2, 0.12, 0.07]}
                    color="#8e785d"
                  />
                ))}
              </>
            )}
            <Eyes y={1.42} z={kook ? 0.46 : 0.425} />
            <mesh
              position={[0, 1.23, kook ? 0.71 : 0.52]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <coneGeometry
                args={[kook ? 0.14 : 0.12, kook ? 0.48 : 0.25, 4]}
              />
              <meshStandardMaterial
                color={kook ? "#a8885e" : "#e6aa5f"}
                roughness={0.8}
              />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side}>
                <Orb
                  position={[side * 0.22, 0.15, 0.12]}
                  scale={[0.18, 0.095, 0.27]}
                  color="#bc8e58"
                />
                <group
                  ref={side === -1 ? left : right}
                  position={[side * 0.43, 0.85, -0.03]}
                >
                  <Orb
                    position={[side * 0.075, 0, 0]}
                    scale={[0.17, 0.4, 0.27]}
                    rotation={[0, 0, -side * 0.15]}
                    color={id === 0 ? "#6f9b8b" : kook ? "#8b7963" : "#638f9d"}
                  />
                </group>
              </group>
            ))}
            {[0, 1, 2].map((i) => (
              <LeafMesh
                key={i}
                position={[
                  (i - 1) * 0.15,
                  kook ? 0.6 : wren ? 1.13 : 0.62,
                  -0.5,
                ]}
                rotation={[wren ? -0.65 : -0.8, 0, (i - 1) * 0.25]}
                scale={[0.1, wren ? 0.72 : 0.45, 0.09]}
                color={
                  id === 0
                    ? ["#b2a4d6", "#8fae9e", "#d1c684"][i]
                    : kook
                      ? "#9b805f"
                      : "#6493af"
                }
              />
            ))}
            {!kook &&
              [0, 1, 2].map((i) => (
                <LeafMesh
                  key={i}
                  position={[(i - 1) * 0.16, 1.87 + (i === 1 ? 0.08 : 0), 0.01]}
                  rotation={[0, 0, -(i - 1) * 0.3]}
                  scale={[0.1, 0.3, 0.07]}
                  color={
                    id === 0 ? ["#9c8fc4", "#b7a8df", "#c6b7e5"][i] : "#6ca7c1"
                  }
                />
              ))}
            {stage >= 2 && (
              <>
                {[-1, 1].map((side) => (
                  <LeafMesh
                    key={side}
                    position={[side * 0.5, 0.84, -0.2]}
                    rotation={[0.4, 0, -side * 0.5]}
                    scale={[0.12, 0.5, 0.1]}
                    color="#b3c8a1"
                  />
                ))}
              </>
            )}
            {stage === 3 && (
              <>
                {[-1, 1].map((side) => (
                  <LeafMesh
                    key={side}
                    position={[side * 0.33, 1.85, -0.13]}
                    rotation={[0, 0, -side * 0.6]}
                    scale={[0.1, 0.43, 0.08]}
                    color="#dfc67d"
                  />
                ))}
                <Orb position={[0, 1.9, 0.32]} scale={0.08} color="#e4cc89" />
              </>
            )}
          </>
        )}
      </group>
    </group>
  );
}
function Flower({ position, color }: { position: Vec; color: string }) {
  return (
    <group position={position}>
      <Stem position={[0, 0.16, 0]} scale={[0.018, 0.3, 0.018]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Orb
          key={i}
          position={[
            Math.sin(i * 1.26) * 0.09,
            0.34,
            Math.cos(i * 1.26) * 0.09,
          ]}
          scale={0.07}
          color={color}
        />
      ))}
      <Orb position={[0, 0.36, 0]} scale={0.055} color="#e1bc56" />
    </group>
  );
}
function Tree({ position, scale = 1 }: { position: Vec; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Stem position={[0, 0.58, 0]} scale={[0.16, 1.2, 0.16]} color="#9b8564" />
      <Orb position={[0, 1.5, 0]} scale={[0.65, 0.95, 0.65]} color="#729783" />
      <Orb position={[-0.38, 1.27, 0.12]} scale={0.5} color="#8bad8c" />
      <Orb position={[0.34, 1.42, 0.09]} scale={0.52} color="#7a9f80" />
    </group>
  );
}
function Habitat({ biome, richness }: { biome: string; richness: number }) {
  const wet = biome === "wetland";
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
      <Orb
        position={[-1.2, 0.02, -1.7]}
        scale={[1.7, 0.22, 1.3]}
        color="#9cb78d"
      />
      <Orb
        position={[1.4, 0.03, -1.9]}
        scale={[1.5, 0.3, 1.2]}
        color="#aac298"
      />
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
      {(biome === "woodland"
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
            ]
      )
        .slice(0, richness ? 4 : 1)
        .map((p, i) => (
          <Tree position={p as Vec} key={i} scale={0.65 + (i % 2) * 0.15} />
        ))}
      {Array.from(
        { length: richness ? (biome === "meadow" ? 16 : 9) : 3 },
        (_, i) => {
          const a = i * 2.399;
          const r = 2.4 + (i % 3) * 0.15;
          return wet ? (
            <group key={i} position={[Math.sin(a) * r, 0, Math.cos(a) * r]}>
              <Stem
                position={[0, 0.3, 0]}
                scale={[0.025, 0.6, 0.025]}
                color="#709477"
              />
              <Orb
                position={[0, 0.57, 0]}
                scale={[0.06, 0.17, 0.05]}
                color="#9d9271"
              />
            </group>
          ) : (
            <Flower
              key={i}
              position={[Math.sin(a) * r, 0.03, Math.cos(a) * r]}
              color={i % 3 === 0 ? "#c7b5d9" : i % 2 ? "#e9c878" : "#ecc2a0"}
            />
          );
        },
      )}
      {[
        [-2.8, 0, 1.4],
        [2.5, 0, 1.6],
        [1.7, 0, -2.7],
      ].map((p, i) => (
        <Orb
          key={i}
          position={p as Vec}
          scale={[0.3, 0.18, 0.25]}
          color="#b3b5a2"
        />
      ))}
      {biome === "woodland" && (
        <Stem
          position={[1.5, 0.12, 1.5]}
          scale={[0.2, 1.3, 0.2]}
          rotation={[0, 0, Math.PI / 2]}
          color="#a38e6c"
        />
      )}
    </group>
  );
}
function CameraReset({ mode, reset }: { mode: string; reset: number }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    camera.position.set(
      ...((mode === "world" ? [6, 6, 8] : [3, 2.5, 4.7]) as [
        number,
        number,
        number,
      ]),
    );
    camera.lookAt(0, mode === "world" ? 0 : 1, 0);
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
}: SceneProps & { reduced: boolean; reset: number }) {
  const controls = useRef<any>(null);
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
      <ambientLight intensity={1.25} />
      <hemisphereLight args={["#fff7e0", "#718977", 1.3]} />
      <directionalLight
        position={[-3, 7, 6]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      {mode === "world" ? (
        <>
          <Habitat biome={biome} richness={characters.length} />
          {characters.map((c, i) => (
            <group
              key={c.id}
              position={placements[i % placements.length]}
              rotation={[0, 0.2 - i * 0.15, 0]}
              scale={0.65}
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
            <group rotation={[0, 0.2, 0]}>
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
        minDistance={mode === "world" ? 6 : 3.2}
        maxDistance={mode === "world" ? 13 : 6.5}
        minPolarAngle={0.45}
        maxPolarAngle={1.45}
        target={mode === "world" ? [0, 0, 0] : [0, 1, 0]}
      />
    </>
  );
}
export default function SceneCanvas(
  props: SceneProps & { visible: boolean; reduced: boolean; reset: number },
) {
  const [ready, setReady] = useState(false);
  return (
    <div
      className="scene-canvas"
      data-scene-ready={ready}
      data-character-count={props.characters.length}
      data-stages={props.characters.map((c) => c.stage).join(",")}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: props.mode === "world" ? [6, 6, 8] : [3, 2.5, 4.7],
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
          setReady(true);
        }}
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}
