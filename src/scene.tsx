import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Creature, Landscape } from "./Art";
import { BiomeId } from "./store";
const SceneCanvas = lazy(() => import("./scene-canvas"));
export type SceneProps = {
  characters: { id: number; stage: number }[];
  biome?: BiomeId;
  mode?: "character" | "world";
  onSelect?: (id: number) => void;
  interaction?: number;
};
class SceneBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ReactNode;
    onFailure: () => void;
  },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function Scene(props: SceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [reset, setReset] = useState(0);
  const [growthBurst, setGrowthBurst] = useState(false);
  const lastInteraction = useRef(props.interaction);
  useEffect(() => {
    const increased =
      props.interaction !== undefined &&
      lastInteraction.current !== undefined &&
      props.interaction > lastInteraction.current;
    lastInteraction.current = props.interaction;
    if (!increased) return;
    setGrowthBurst(true);
    const timer = setTimeout(() => setGrowthBurst(false), 1000);
    return () => clearTimeout(timer);
  }, [props.interaction]);
  const reduced = !!useReducedMotion();
  useEffect(() => {
    try {
      if (new URLSearchParams(location.search).has("fallback")) {
        setAvailable(false);
        return;
      }
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      setAvailable(!!gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setAvailable(false);
    }
  }, []);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const fallback = (
    <div className="scene-fallback">
      <Landscape>
        {props.characters.map((c, i) => (
          <button
            key={c.id}
            style={{ left: 8 + i * 24 + "%" }}
            onClick={() => props.onSelect?.(c.id)}
            aria-label={"Select illustrated companion " + c.id}
          >
            <Creature kind={c.id} stage={c.stage} />
          </button>
        ))}
      </Landscape>
      <span>3D unavailable · illustrated fallback</span>
    </div>
  );
  return (
    <div
      className={
        (growthBurst ? "growth-reaction " : "") +
        "scene-stage " +
        (props.mode === "world" ? "world-stage" : "portrait-stage")
      }
      ref={host}
    >
      {growthBurst && (
        <span className="growth-burst" role="status">
          +10 Growth XP ✦
        </span>
      )}
      {available === false ? (
        fallback
      ) : available === null ? (
        <div className="scene-loading">Preparing a little wonder…</div>
      ) : (
        <SceneBoundary
          fallback={fallback}
          onFailure={() => setAvailable(false)}
        >
          <Suspense
            fallback={
              <div className="scene-loading">Bringing your world to life…</div>
            }
          >
            <SceneCanvas
              {...props}
              visible={visible}
              reduced={reduced}
              reset={reset}
            />
          </Suspense>
        </SceneBoundary>
      )}
      {available && (
        <button
          className="scene-reset icon-button"
          aria-label="Reset 3D camera"
          onClick={() => setReset((r) => r + 1)}
        >
          <RotateCcw size={17} />
        </button>
      )}
      <span className="scene-hint">
        {available
          ? "Drag to rotate · pinch to zoom"
          : "Original character illustration"}
      </span>
    </div>
  );
}
