import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Pause,
  Play,
} from "lucide-react";
import { Creature, Landscape } from "./Art";
import { BiomeId } from "./store";
import { useApp } from "./context";
import { species } from "./data";
const SceneCanvas = lazy(() => import("./scene-canvas"));
export type SceneProps = {
  characters: { id: number; stage: number }[];
  biome?: BiomeId;
  mode?: "character" | "world";
  onSelect?: (id: number) => void;
  interaction?: number;
  quality?: "balanced" | "low";
  onUnavailable?: () => void;
  cameraCommand?: { id: number; action: "left" | "right" | "in" | "out" };
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
  const { state, setState } = useApp();
  const settings = state.visualSettings || {
    quality: "balanced" as const,
    paused: false,
  };
  const illustrated = settings.quality === "illustrated";
  const [attempt, setAttempt] = useState(0);
  const [cameraCommand, setCameraCommand] =
    useState<SceneProps["cameraCommand"]>();
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
  const [prefersReduced, setPrefersReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const reduced = prefersReduced || settings.paused;
  useEffect(() => {
    try {
      if (illustrated || new URLSearchParams(location.search).has("fallback")) {
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
  }, [illustrated, attempt]);
  useEffect(() => {
    if (!available) return;
    const timeout = setTimeout(() => {
      if (!host.current?.querySelector('[data-scene-ready="true"]'))
        setAvailable(false);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [available, attempt]);
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
        {props.characters.map((c, i) =>
          props.onSelect ? (
            <button
              className="illustrated-companion"
              key={c.id}
              style={{ left: 8 + i * 24 + "%" }}
              onClick={() => props.onSelect?.(c.id)}
              aria-label={`Select ${species[c.id]?.pet || "companion"}, stage ${c.stage}`}
            >
              <Creature kind={c.id} stage={c.stage} />
            </button>
          ) : (
            <div
              className="illustrated-companion"
              key={c.id}
              style={{ left: 8 + i * 24 + "%" }}
              role="img"
              aria-label={`${species[c.id]?.pet || "Companion"}, stage ${c.stage}`}
            >
              <Creature kind={c.id} stage={c.stage} />
            </div>
          ),
        )}
      </Landscape>
      <span>
        {illustrated
          ? "Illustrated view · original companion artwork"
          : "3D unavailable · illustrated fallback"}
      </span>
    </div>
  );
  return (
    <section
      className="scene-container"
      aria-label={
        props.mode === "world"
          ? "Interactive companion world"
          : "Companion viewer"
      }
    >
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
            key={attempt}
            fallback={fallback}
            onFailure={() => setAvailable(false)}
          >
            <Suspense
              fallback={
                <div className="scene-loading">
                  Bringing your world to life…
                </div>
              }
            >
              <SceneCanvas
                {...props}
                visible={visible}
                reduced={reduced}
                reset={reset}
                quality={settings.quality === "low" ? "low" : "balanced"}
                cameraCommand={cameraCommand}
                onUnavailable={() => setAvailable(false)}
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
      <div className="scene-toolbar">
        <label>
          Graphics
          <select
            aria-label="Graphics quality"
            value={settings.quality}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                visualSettings: {
                  ...settings,
                  quality: e.target.value as "balanced" | "low" | "illustrated",
                },
              }))
            }
          >
            <option value="balanced">Balanced 3D</option>
            <option value="low">Lightweight 3D</option>
            <option value="illustrated">Illustrated</option>
          </select>
        </label>
        {available && !prefersReduced && (
          <button
            className="icon-button"
            aria-label={
              settings.paused ? "Resume animations" : "Pause animations"
            }
            aria-pressed={settings.paused}
            onClick={() =>
              setState((s) => ({
                ...s,
                visualSettings: { ...settings, paused: !settings.paused },
              }))
            }
          >
            {settings.paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
        )}
        {!available && !illustrated && (
          <button
            className="text-link"
            onClick={() => {
              setAvailable(null);
              setAttempt((a) => a + 1);
            }}
          >
            Try 3D Again
          </button>
        )}
      </div>
      {available && (
        <div
          className="scene-keyboard-controls"
          aria-label="3D camera controls"
        >
          {(
            [
              ["left", "Rotate left", RotateCcw],
              ["right", "Rotate right", RotateCw],
              ["in", "Zoom in", ZoomIn],
              ["out", "Zoom out", ZoomOut],
            ] as const
          ).map(([action, label, Icon]) => (
            <button
              key={action}
              className="icon-button"
              aria-label={label}
              onClick={() =>
                setCameraCommand((c) => ({ id: (c?.id || 0) + 1, action }))
              }
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
