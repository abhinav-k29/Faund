import { config } from "./config";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronRight,
  Leaf,
  RefreshCw,
  Sparkles,
  TreePine,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Creature } from "./Art";
import { companionDetails } from "./companion-data";
import { useApp } from "./context";
import { Species, species } from "./data";
import { biomeFor, characterProgress } from "./store";
import { Button, Heading, Photo, Pill, dateLabel } from "./ui";
export function SpeciesCard({
  s,
  character = false,
}: {
  s: Species;
  character?: boolean;
}) {
  const { state } = useApp();
  const sightings = state.observations.filter((o) => o.speciesId === s.id);
  const progress = characterProgress(state, s.id);
  const points = progress.growth / 3;
  const stage = progress.stage;
  return (
    <div
      className={`species-card ${character ? "character-card" : ""}`}
      style={{ "--card-color": s.color } as React.CSSProperties}
    >
      <div className="card-top">
        <span>{character ? "FICTIONAL COMPANION" : "REAL SPECIES"}</span>
        <span>NO. {String(s.id + 1).padStart(3, "0")}</span>
      </div>
      {character ? (
        <div className={"character-art stage-" + stage}>
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <Creature kind={s.id} stage={stage} />
          <span className="art-spark s1">✦</span>
          <span className="art-spark s2">✧</span>
          <span className="character-level">LVL {progress.level}</span>
        </div>
      ) : (
        <Photo id={s.id} />
      )}
      <div className="card-body">
        <Pill lavender={character}>{character ? s.type : s.category}</Pill>
        <h2>{character ? s.pet : s.name}</h2>
        <p className={character ? "" : "latin"}>
          {character ? companionDetails[s.id].stages[stage - 1] : s.latin}
        </p>
        {character ? (
          <>
            <div className="card-facts">
              <div>
                <span>FICTIONAL ABILITY</span>
                <strong>
                  {s.id === 0
                    ? "Blossom Boost"
                    : s.id === 3
                      ? "Pollen Pulse"
                      : "Wild Growth"}
                </strong>
              </div>
              <div>
                <span>EVOLUTION</span>
                <strong>Stage {stage} of 3</strong>
              </div>
            </div>
            <div className="progress-label">
              <span>
                {stage === 3
                  ? "Fully blossomed"
                  : "Growing into something wonderful"}
              </span>
              <b>{Math.round(points)}%</b>
            </div>
            <div className="progress">
              <span style={{ width: points + "%" }} />
            </div>
            <p className="card-description">
              {companionDetails[s.id].personality} Fictional gameplay; progress
              does not measure ecological health.
            </p>
          </>
        ) : (
          <>
            <div className="card-facts">
              <div>
                <span>HABITAT</span>
                <strong>{s.habitat}</strong>
              </div>
              <div>
                <span>DIET / NEEDS</span>
                <strong>{s.diet}</strong>
              </div>
            </div>
            <p className="card-description">{s.fact}</p>
            <div className="card-footer">
              <span>
                <Leaf size={13} />
                {s.role}
              </span>
              <span>FIELD NOTES · AU</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export function CardPage() {
  const { id } = useParams();
  const s = species[Number(id)];
  const { state, setState, toast } = useApp();
  const n = useNavigate();
  const loc = useLocation();
  const [flipped, setFlipped] = useState(loc.search.includes("character"));
  const sideRef = useRef(flipped);
  useEffect(() => {
    const next = new URLSearchParams(loc.search).get("side") === "character";
    sideRef.current = next;
    setFlipped(next);
  }, [loc.search]);
  const flip = () => {
    const query = new URLSearchParams(loc.search);
    const next = !sideRef.current;
    sideRef.current = next;
    query.set("side", next ? "character" : "species");
    setFlipped(next);
    n(
      { pathname: loc.pathname, search: query.toString() },
      { replace: true, preventScrollReset: true },
    );
  };
  if (!s) return <Navigate to="/field-guide" />;
  const observations = state.observations.filter((o) => o.speciesId === s.id);
  return (
    <>
      <Heading
        eyebrow={
          observations.length
            ? "YOUR PRIVATE FIELD JOURNAL"
            : "FIELD GUIDE · BROWSING"
        }
        title={
          flipped ? "A discovery’s other side." : "Every discovery has a story."
        }
        back
      />
      <div
        className="flip-scene"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--glare-x",
            `${((e.clientX - r.left) / r.width) * 100}%`,
          );
          e.currentTarget.style.setProperty(
            "--glare-y",
            `${((e.clientY - r.top) / r.height) * 100}%`,
          );
        }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("a,button")) flip();
        }}
      >
        <div className={"flip-inner " + (flipped ? "flipped" : "")}>
          <div className="flip-face" inert={flipped}>
            <SpeciesCard s={s} />
          </div>
          <div className="flip-face flip-back" inert={!flipped}>
            <SpeciesCard s={s} character />
          </div>
        </div>
      </div>
      {flipped && (
        <Link className="text-link card-3d-link" to={"/character/" + s.id}>
          Inspect {s.pet} in 3D <Sparkles size={16} />
        </Link>
      )}
      <Button
        secondary
        aria-pressed={flipped}
        aria-label="Real Species ↔ Companion"
        onClick={flip}
      >
        <RefreshCw size={18} /> Real Species ↔ Companion
      </Button>
      <p className="sr-only" aria-live="polite">
        {flipped
          ? "Fictional companion side shown."
          : "Real species side shown."}
      </p>
      {observations.length > 0 && flipped && (
        <Button
          onClick={() => {
            setState((v) => ({
              ...v,
              ecosystem: [...new Set([...v.ecosystem, s.id])],
              game: { ...v.game, selectedBiome: biomeFor(s.id) },
            }));
            toast(`${s.pet} is at home in your ecosystem.`);
            n("/ecosystem");
          }}
        >
          {state.ecosystem.includes(s.id)
            ? "Visit My Ecosystem"
            : "Add to My Ecosystem"}{" "}
          <TreePine size={19} />
        </Button>
      )}
      <details>
        <summary>Scientific notes & source</summary>
        <p>
          {s.fact} Ecological role: {s.role.toLowerCase()}.
        </p>
        <a
          className="text-link"
          href={s.source}
          target="_blank"
          rel="noreferrer"
        >
          Read the species source <ArrowUpRight size={15} />
        </a>
        <p className="footnote">
          No conservation classification asserted. Identification is unverified.{" "}
          <Link to="/credits">Photo credits &amp; licences</Link>.
        </p>
      </details>
      <details>
        <summary>Private observation history · {observations.length}</summary>
        {observations.length ? (
          observations.map((o) => (
            <Link
              className="history-row"
              key={o.id}
              to={"/contributions?record=" + o.id}
            >
              <span>{dateLabel(o.observedAt)}</span>
              <small>{o.identification}</small>
              <ChevronRight size={17} />
            </Link>
          ))
        ) : (
          <p>
            You’re browsing the guide. This species hasn’t been added to your
            collection.
          </p>
        )}
      </details>
      {!observations.length && (
        <Button onClick={() => n("/scan")}>
          Make a discovery <Camera size={18} />
        </Button>
      )}
    </>
  );
}
export function Unlock() {
  const { id } = useParams();
  const s = species[Number(id)] || species[0];
  const n = useNavigate();
  const reduced = useReducedMotion();
  const [reveal, setReveal] = useState(!!reduced);
  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 1700);
    return () => clearTimeout(t);
  }, []);
  if (!species[Number(id)]) return <Navigate to="/collection" replace />;
  return (
    <div className="unlock">
      <button className="text-button skip" onClick={() => setReveal(true)}>
        Skip animation
      </button>
      <p className="eyebrow">
        {reveal ? "NEW COMPANION UNLOCKED!" : "NEW DISCOVERY!"}
      </p>
      <h1>
        {reveal ? "Reality has another side." : "A little closer to the wild."}
      </h1>
      <div className="celebration">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties}>
            ✦
          </span>
        ))}
        <motion.div
          key={String(reveal)}
          initial={{ opacity: 0, rotateY: reduced ? 0 : -60, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        >
          <SpeciesCard s={s} character={reveal} />
        </motion.div>
      </div>
      <p>
        {reveal
          ? `Meet ${s.pet}. Inspired by ${s.name.toLowerCase()}.`
          : "Your observation is saved in your private field journal."}
      </p>
      <Button onClick={() => n("/card/" + s.id + "?side=character")}>
        Meet Your Companion <Sparkles size={18} />
      </Button>
      <Button secondary onClick={() => n("/collection")}>
        View Collection
      </Button>
      <Link className="text-link" to="/scan">
        Continue Exploring <ArrowRight size={16} />
      </Link>
    </div>
  );
}
