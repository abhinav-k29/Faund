import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  ChevronRight,
  FlaskConical,
  ImagePlus,
  Leaf,
  LocateFixed,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TreePine,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useApp } from "./context";
import { species, Species } from "./data";
import { Observation, activeConsent, repository, uid } from "./store";
import { config } from "./config";
import { Creature } from "./Art";
import {
  Button,
  Heading,
  Modal,
  Pill,
  Photo,
  dateLabel,
  localTime,
  readPhoto,
} from "./ui";
export function Scanner() {
  const { draft, setDraft, toast } = useApp();
  const n = useNavigate();
  const [camera, setCamera] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  async function start() {
    setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Live camera needs HTTPS and browser permission. Upload a photo or choose a demo sample.",
        );
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (!alive.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = s;
      setCamera(true);
      setTimeout(() => {
        if (video.current) video.current.srcObject = s;
      }, 0);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Camera unavailable. Try a photo or demo sample.",
      );
    } finally {
      setBusy(false);
    }
  }
  function capture() {
    if (!video.current) return;
    const c = document.createElement("canvas");
    if (!video.current.videoWidth) {
      setError("Camera is still starting. Try again in a moment.");
      return;
    }
    const scale = Math.min(
      1,
      1200 / Math.max(video.current.videoWidth, video.current.videoHeight),
    );
    c.width = video.current.videoWidth * scale;
    c.height = video.current.videoHeight * scale;
    c.getContext("2d")!.drawImage(video.current, 0, 0, c.width, c.height);
    setDraft((d) => ({
      ...d,
      photo: c.toDataURL("image/jpeg", 0.75),
      provenance: "User photo · simulated identification",
    }));
    stream.current?.getTracks().forEach((t) => t.stop());
    setCamera(false);
    toast("Photo captured. Choose an example identification below.");
  }
  return (
    <>
      <Heading
        eyebrow="LOOK A LITTLE CLOSER"
        title="What’s hiding in plain sight?"
        sub="Point your camera at a plant or animal."
        back
      />
      <div className="camera-view">
        {camera ? (
          <video ref={video} autoPlay playsInline muted />
        ) : draft.photo ? (
          <img src={draft.photo} alt="Your locally captured organism" />
        ) : (
          <>
            <Photo id={0} />
            <div className="camera-shade" />
          </>
        )}
        <div className="viewfinder" />
        <span className="camera-label">
          <span className="live-dot" />
          {camera
            ? "CAMERA PREVIEW"
            : draft.photo
              ? "YOUR PHOTO · LOCAL ONLY"
              : "DEMO PREVIEW"}
        </span>
        <div className="camera-instructions">
          {draft.photo
            ? "Photo captured. No AI identification performed."
            : "A little patience. A little wonder."}
        </div>
      </div>
      {error && (
        <div className="notice" role="status">
          {error}
        </div>
      )}
      <div className="camera-controls">
        <label
          className="icon-button upload"
          aria-label="Choose or take a photo"
        >
          <ImagePlus />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f)
                try {
                  const photo = await readPhoto(f);
                  setDraft((d) => ({
                    ...d,
                    photo,
                    provenance: "User photo · simulated identification",
                  }));
                  toast("Photo saved locally. Choose a demo identification.");
                } catch (e) {
                  setError(String(e));
                }
            }}
          />
        </label>
        <button
          className="shutter"
          disabled={busy}
          onClick={camera ? capture : start}
          aria-label={camera ? "Capture photo" : "Enable camera"}
        >
          <Camera size={27} />
        </button>
        <button
          className="icon-button"
          aria-label="Clear photo"
          onClick={() => {
            setDraft((d) => ({ ...d, photo: undefined }));
            setError("");
          }}
        >
          <RefreshCw />
        </button>
      </div>
      <div className="section-title">
        <h2>Try a sample discovery</h2>
        <Pill>DEMO</Pill>
      </div>
      <p className="muted">
        No identification model is connected. Select an example to experience
        the discovery journey.
      </p>
      <div className="sample-grid">
        {species.map((s) => (
          <button
            aria-label={s.name}
            key={s.id}
            onClick={() => {
              setScanning(s.id);
              setDraft((d) => ({
                ...d,
                uncertain: false,
                provenance: d.photo
                  ? "User photo · simulated identification"
                  : "Demo sample identification",
              }));
              timer.current = setTimeout(() => n("/identify/" + s.id), 1000);
            }}
          >
            <Photo id={s.id} />
            <span>{s.name}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
      <p className="footnote">
        Observe safely. Keep your distance, leave nests alone, and stay on
        public paths.
      </p>
      {scanning !== null && (
        <div className="scan-overlay" role="status">
          <div className="scan-orbit">
            <Leaf size={34} />
          </div>
          <h2>Looking closer…</h2>
          <p>Preparing your demo discovery.</p>
          <Button
            secondary
            onClick={() => {
              if (timer.current) clearTimeout(timer.current);
              setScanning(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </>
  );
}
export function Identify() {
  const { id } = useParams();
  const s = species[Number(id)] || species[0];
  const n = useNavigate();
  const { draft, setDraft } = useApp();
  const [matches, setMatches] = useState(false);
  return (
    <>
      <Heading
        eyebrow="DEMO IDENTIFICATION"
        title="Well, look what you found."
        back
      />
      <div className="result-photo">
        <Photo id={s.id} />
        <Pill>Possible Match Found</Pill>
      </div>
      <p className="eyebrow top-space">SUGGESTED IDENTIFICATION</p>
      <h1>{s.name}</h1>
      <p className="latin">{s.latin}</p>
      <Pill>{s.category}</Pill>
      <p>
        Take a closer look at the colours and markings. This is a selected demo
        suggestion, not an AI result or expert verification.
      </p>
      {draft.photo && (
        <div className="notice">
          Your photo will be saved with the selected example identification. It
          has not been classified.
        </div>
      )}
      <Button
        onClick={() => {
          setDraft((d) => ({ ...d, uncertain: false }));
          n("/record/" + s.id);
        }}
      >
        Looks Right <Check size={19} />
      </Button>
      <Button secondary onClick={() => setMatches(true)}>
        Compare Similar Species
      </Button>
      <button
        className="text-button"
        onClick={() => {
          setDraft((d) => ({ ...d, uncertain: true }));
          n("/record/" + s.id);
        }}
      >
        Not Sure · save a mystery discovery
      </button>
      {matches && (
        <Modal
          title="Choose a demo alternative"
          onClose={() => setMatches(false)}
        >
          <p>These are selectable examples, not ranked visual matches.</p>
          {species
            .filter((x) => x.id !== s.id)
            .map((x) => (
              <button
                className="match-row"
                key={x.id}
                onClick={() => {
                  setMatches(false);
                  n("/identify/" + x.id);
                }}
              >
                <Photo id={x.id} />
                <div>
                  <h3>{x.name}</h3>
                  <p>{x.latin}</p>
                </div>
                <ChevronRight />
              </button>
            ))}
        </Modal>
      )}
    </>
  );
}
export function Record() {
  const { id } = useParams();
  const s = species[Number(id)] || species[0];
  const { state, setState, draft, setDraft, toast } = useApp();
  const n = useNavigate();
  const task = state.tasks.find((t) => t.id === draft.taskId);
  const site = state.sites.find((x) => x.id === draft.siteId);
  const [location, setLocation] = useState(
    site?.location || "Sydney · example area",
  );
  const [siteName, setSiteName] = useState(site?.name || "");
  const [siteId, setSiteId] = useState(site?.id || "");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  }>();
  const [uncertainty, setUncertainty] = useState(site?.uncertainty || 1000);
  const [locError, setLocError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [provenance] = useState(
    draft.photo
      ? "User photo · simulated identification"
      : "Demo sample identification",
  );
  const [observedAt, setObservedAt] = useState(localTime());
  const [category, setCategory] = useState(s.category);
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const consent = activeConsent(state);
    if (!consent) {
      n("/consent");
      return;
    }
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const duration = Number(f.get("duration"));
    const notes = String(f.get("notes") || "");
    const observedCategory = draft.uncertain ? category : s.category;
    if (
      (task?.id === "tree" && observedCategory !== "Plants") ||
      (task?.id === "birds" && observedCategory !== "Birds")
    ) {
      setError(
        "This task requires an observation of " +
          (task.id === "tree" ? "a tree or plant." : "a bird."),
      );
      setSaving(false);
      return;
    }
    if (task && duration < task.duration) {
      setError(
        `This task requires at least ${task.duration} minutes of effort.`,
      );
      setSaving(false);
      return;
    }
    if (task?.id === "tree" && !notes.trim()) {
      setError("Describe foliage or flowering for Urban Tree Watch.");
      setSaving(false);
      return;
    }
    const newSiteId = siteId || (siteName.trim() ? uid() : "");
    const obs: Observation = {
      id: uid(),
      contributor: config.participantId,
      speciesId: draft.uncertain ? null : s.id,
      provisional: draft.uncertain ? category : "",
      observedAt,
      createdAt: new Date().toISOString(),
      location,
      coordinates,
      uncertainty,
      photo: draft.photo,
      identification: draft.uncertain
        ? "Identification unconfirmed"
        : "User-confirmed demo identification",
      review: "Awaiting review",
      reviewNotes: "",
      method: String(f.get("method")),
      notes,
      taskId: task?.id || "",
      siteId: newSiteId,
      consentId: consent.id,
      sensitive: f.get("sensitive") === "on",
      provenance,
      recordType: "HumanObservation",
      individuals: Number(f.get("individuals")),
      duration,
      habitat: String(f.get("habitat")),
      activity: String(f.get("activity")),
      weather: String(f.get("weather")),
    };
    const next = {
      ...state,
      observations: [...state.observations, obs],
      xp: state.xp + 20,
      sites:
        siteName.trim() && !siteId
          ? [
              ...state.sites,
              {
                id: newSiteId,
                name: siteName,
                location,
                uncertainty,
                habitat: obs.habitat,
              },
            ]
          : state.sites,
    };
    try {
      repository.save(next);
      setState(next);
      setDraft({});
      const existing = state.observations.some((o) => o.speciesId === s.id);
      if (draft.uncertain) {
        toast("Mystery discovery saved · identification unconfirmed");
        n("/contributions");
      } else if (existing) {
        toast("Another sighting! Added to your history. +20 XP");
        n("/card/" + s.id);
      } else n("/unlock/" + s.id);
    } catch {
      setError(
        "Browser storage is full. Try a smaller photo or delete older records.",
      );
      setSaving(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow={task ? "RESEARCH TASK · " + task.title : "YOUR OBSERVATION"}
        title="Record Your Discovery"
        sub="A little detail can make a discovery more useful."
        back
      />
      <div className="record-species">
        {draft.photo ? (
          <img className="photo" src={draft.photo} alt="Your observation" />
        ) : (
          <Photo id={s.id} />
        )}
        <div>
          <h3>{draft.uncertain ? "Mystery Discovery" : s.name}</h3>
          <p>
            {draft.uncertain ? "Every discovery starts somewhere." : s.latin}
          </p>
          <Pill>
            {draft.uncertain ? "Unconfirmed" : "User-confirmed · demo"}
          </Pill>
        </div>
      </div>
      <form onSubmit={save} className="form">
        {draft.uncertain && (
          <label>
            General category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "Birds",
                "Plants",
                "Insects",
                "Mammals",
                "Fungi",
                "Unknown organism",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Date and time
          <input
            type="datetime-local"
            required
            value={observedAt}
            max={localTime()}
            onChange={(e) => setObservedAt(e.target.value)}
          />
        </label>
        <label>
          Record provenance
          <input value={provenance} readOnly />
        </label>
        <div className="section-title">
          <h3>Where did you observe it?</h3>
          <MapPin size={18} />
        </div>
        <p className="muted">
          Location helps study species distribution. Nothing is tracked in the
          background. Coordinates stay out of exports.
        </p>
        {state.sites.length > 0 && (
          <label>
            Previously saved site
            <select
              value={siteId}
              onChange={(e) => {
                setSiteId(e.target.value);
                const selected = state.sites.find(
                  (s) => s.id === e.target.value,
                );
                if (selected) {
                  setLocation(selected.location);
                  setUncertainty(selected.uncertainty);
                  setSiteName(selected.name);
                  setCoordinates(undefined);
                }
              }}
            >
              <option value="">New or unsaved site</option>
              {state.sites.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Location description
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Broad area or public park"
          />
        </label>
        <div className="form-two">
          <label>
            Location uncertainty (m)
            <input
              type="number"
              required
              min="1"
              value={uncertainty}
              onChange={(e) => setUncertainty(Number(e.target.value))}
            />
          </label>
          <label>
            Save site as (optional)
            <input
              value={siteName}
              disabled={!!siteId}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Street tree"
            />
          </label>
        </div>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            if (!navigator.geolocation) {
              setLocError(
                "Device location unavailable. Enter a manual area above.",
              );
              return;
            }
            setLocError("Requesting device location…");
            navigator.geolocation.getCurrentPosition(
              (p) => {
                setCoordinates({
                  lat: p.coords.latitude,
                  lon: p.coords.longitude,
                });
                setUncertainty(Math.ceil(p.coords.accuracy));
                setLocError(
                  "Device location attached privately. Broad description stays editable.",
                );
              },
              () =>
                setLocError("Location unavailable. Enter a manual area above."),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
            );
          }}
        >
          <LocateFixed size={17} /> Use device location once
        </button>
        {locError && (
          <p className="muted" role="status">
            {locError}
          </p>
        )}
        <label>
          Observation notes
          {task?.id === "tree" ? " · foliage / flowering required" : ""}
          <textarea
            name="notes"
            rows={3}
            required={task?.id === "tree"}
            placeholder="What did you notice? Avoid personal information."
          />
        </label>
        <details open={!!task}>
          <summary>
            Research details {task ? "· task protocol" : "· optional context"}
          </summary>
          <div className="form-two">
            <label>
              Individuals observed
              <input
                type="number"
                name="individuals"
                min="1"
                max="100000"
                defaultValue="1"
                required
              />
            </label>
            <label>
              Duration (minutes)
              <input
                name="duration"
                type="number"
                min={task?.duration || 0}
                defaultValue={task?.duration || 0}
                required
              />
            </label>
          </div>
          <label>
            Habitat
            <select name="habitat">
              {[
                "Urban green space",
                "Garden",
                "Woodland",
                "Wetland",
                "Grassland",
                "Coastal habitat",
                "Not recorded",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Method
            <select name="method">
              <option>Visual observation</option>
              <option>Photo observation</option>
              <option>Timed stationary survey</option>
            </select>
          </label>
          <label>
            Activity
            <input name="activity" placeholder="e.g. feeding, flowering" />
          </label>
          <label>
            Weather
            <input name="weather" placeholder="e.g. clear, light wind" />
          </label>
        </details>
        <label className="checkbox">
          <input type="checkbox" name="sensitive" />
          <span>Restrict this location further (sensitive observation).</span>
        </label>
        <div className="notice">
          <ShieldCheck size={20} />
          <p>
            This observation joins your private collection and the authorised
            research dataset described in your agreement. Both stay only in this
            browser. No data is transmitted.
          </p>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          Save Observation <ArrowRight size={19} />
        </Button>
      </form>
    </>
  );
}
export function SpeciesCard({
  s,
  character = false,
}: {
  s: Species;
  character?: boolean;
}) {
  const { state } = useApp();
  const sightings = state.observations.filter((o) => o.speciesId === s.id);
  const points = Math.min(
    100,
    sightings.length * 20 + state.claimed.length * 15,
  );
  const stage = points < 35 ? 1 : points < 75 ? 2 : 3;
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
          <span className="character-level">
            LVL {1 + Math.floor(points / 20)}
          </span>
        </div>
      ) : (
        <Photo id={s.id} />
      )}
      <div className="card-body">
        <Pill lavender={character}>{character ? s.type : s.category}</Pill>
        <h2>{character ? s.pet : s.name}</h2>
        <p className={character ? "" : "latin"}>
          {character ? "A little guardian. A whole lot of wonder." : s.latin}
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
              <b>{points}%</b>
            </div>
            <div className="progress">
              <span style={{ width: points + "%" }} />
            </div>
            <p className="card-description">
              {s.id === 0
                ? "A little guardian that carries colour from blossom to blossom."
                : "A curious companion inspired by the living world."}{" "}
              Fictional gameplay; progress does not measure ecological health.
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
  if (!s) return <Navigate to="/explore" />;
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
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("a,button"))
            setFlipped(!flipped);
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
      <Button secondary onClick={() => setFlipped(!flipped)}>
        <RefreshCw size={18} /> Real Species ↔ Companion
      </Button>
      {observations.length > 0 && flipped && (
        <Button
          onClick={() => {
            setState((v) => ({
              ...v,
              ecosystem: [...new Set([...v.ecosystem, s.id])],
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
          No conservation classification asserted. Demo identification is not
          expert verification.{" "}
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
          : "Your observation is saved locally · awaiting review."}
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
export function ObservationDetails({
  o,
  research = false,
  onClose,
}: {
  o: Observation;
  research?: boolean;
  onClose: () => void;
}) {
  const { state, setState, toast } = useApp();
  const [notes, setNotes] = useState(o.reviewNotes);
  const [correction, setCorrection] = useState(o.notes);
  const s = o.speciesId === null ? null : species[o.speciesId];
  const consent = state.consents.find((c) => c.id === o.consentId);
  const task = state.tasks.find((t) => t.id === o.taskId);
  return (
    <Modal title={s?.name || "Mystery Discovery"} onClose={onClose}>
      {research && o.sensitive ? (
        <div className="notice">
          Photograph withheld for this sensitive observation.
        </div>
      ) : o.photo ? (
        <img
          className="detail-photo"
          src={o.photo}
          alt="Observation photograph"
        />
      ) : s ? (
        <Photo id={s.id} className="detail-photo" />
      ) : null}
      <Pill>{o.review}</Pill>
      <p className="latin">{s?.latin || o.provisional}</p>
      <dl className="metadata">
        {[
          ["Record ID", o.id],
          ["Contributor", o.contributor],
          ["Observed", new Date(o.observedAt).toLocaleString("en-AU")],
          ["Created", new Date(o.createdAt).toLocaleString("en-AU")],
          [
            "Location",
            o.sensitive && research ? "Restricted location" : o.location,
          ],
          [
            "Coordinates",
            o.sensitive && research
              ? "Withheld"
              : o.coordinates
                ? `${o.coordinates.lat.toFixed(5)}, ${o.coordinates.lon.toFixed(5)} · private`
                : "Not collected",
          ],
          ["Uncertainty", o.uncertainty + " m"],
          ["Method", o.method],
          ["Effort", o.duration + " minutes"],
          ["Individuals", o.individuals],
          ["Habitat", o.habitat],
          ["Activity", o.activity || "Not recorded"],
          ["Weather", o.weather || "Not recorded"],
          ["Identification", o.identification],
          ["Task", task?.title || "Casual observation"],
          [
            "Site",
            o.sensitive && research
              ? "Restricted"
              : state.sites.find((s) => s.id === o.siteId)?.name ||
                "Unsaved site",
          ],
          [
            "Consent",
            consent
              ? `v${consent.version} · ${dateLabel(consent.timestamp)}${consent.withdrawnAt ? " · withdrawn" : ""}`
              : "No linked consent",
          ],
          ["Provenance", o.provenance],
          ["Record type", o.recordType],
          [
            "Notes",
            research && o.sensitive
              ? "Withheld for restricted record"
              : o.notes || "None",
          ],
        ].map(([a, b]) => (
          <React.Fragment key={a}>
            <dt>{a}</dt>
            <dd>{b}</dd>
          </React.Fragment>
        ))}
      </dl>
      {research ? (
        <>
          <label>
            Internal demo review notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="button-row">
            {["Demo reviewed", "Needs clarification", "Awaiting review"].map(
              (status) => (
                <Button
                  key={status}
                  secondary
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      observations: s.observations.map((x) =>
                        x.id === o.id
                          ? { ...x, review: status, reviewNotes: notes }
                          : x,
                      ),
                    }));
                    toast(
                      "Local demo review saved. No expert verification asserted.",
                    );
                    onClose();
                  }}
                >
                  {status}
                </Button>
              ),
            )}
          </div>
          <Button
            secondary
            onClick={() => {
              setState((s) => ({
                ...s,
                observations: s.observations.filter((x) => x.id !== o.id),
              }));
              toast("Local record deleted.");
              onClose();
            }}
          >
            Delete Local Record
          </Button>
          <p className="footnote">
            Review is simulated. Marking a record reviewed does not
            independently verify identification.
          </p>
        </>
      ) : (
        <>
          <label>
            Correct your observation notes
            <textarea
              value={correction}
              onChange={(e) => setCorrection(e.target.value)}
            />
          </label>
          <Button
            secondary
            onClick={() => {
              setState((s) => ({
                ...s,
                observations: s.observations.map((x) =>
                  x.id === o.id
                    ? { ...x, notes: correction, review: "Awaiting review" }
                    : x,
                ),
              }));
              toast("Correction saved; review reset.");
              onClose();
            }}
          >
            Save Correction
          </Button>
          <Button
            secondary
            onClick={() => {
              setState((s) => ({
                ...s,
                observations: s.observations.filter((x) => x.id !== o.id),
              }));
              toast("Local observation deleted.");
              onClose();
            }}
          >
            Delete Local Record
          </Button>
        </>
      )}
      <p className="footnote">
        Local demonstration · no external transmission or scientific
        verification.
      </p>
    </Modal>
  );
}
export function Contributions() {
  const { state } = useApp();
  const loc = useLocation();
  const [selected, setSelected] = useState(
    new URLSearchParams(loc.search).get("record") || "",
  );
  const o = state.observations.find((o) => o.id === selected);
  return (
    <>
      <Heading
        eyebrow="YOUR CURIOSITY, IN CONTEXT"
        title="My Contributions"
        sub="From a moment outside to a structured observation."
        back
      />
      <div className="stat-grid">
        <div>
          <strong>{state.observations.length}</strong>
          <span>observations</span>
        </div>
        <div>
          <strong>
            {
              new Set(state.observations.map((o) => o.siteId).filter(Boolean))
                .size
            }
          </strong>
          <span>sites documented</span>
        </div>
        <div>
          <strong>
            {
              new Set(state.observations.map((o) => o.taskId).filter(Boolean))
                .size
            }
          </strong>
          <span>research tasks</span>
        </div>
      </div>
      <div className="notice">
        <FlaskConical />
        <p>
          Locally saved — not scientifically reviewed. These records also appear
          in the researcher demonstration in this browser.
        </p>
      </div>
      <div className="observations-list">
        {[...state.observations].reverse().map((o) => (
          <button
            className="observation-row"
            key={o.id}
            onClick={() => setSelected(o.id)}
          >
            {o.photo ? (
              <img src={o.photo} className="photo" alt="Observation" />
            ) : o.speciesId !== null ? (
              <Photo id={o.speciesId} />
            ) : (
              <span className="mystery">
                <Leaf />
              </span>
            )}
            <div>
              <h3>
                {o.speciesId === null
                  ? "Mystery Discovery"
                  : species[o.speciesId].name}
              </h3>
              <p>
                {dateLabel(o.observedAt)} ·{" "}
                {o.sensitive ? "Restricted site" : o.location}
              </p>
              <small>
                {o.identification} · {o.review}
              </small>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      {!state.observations.length && (
        <div className="empty">
          <FlaskConical />
          <h2>Your first observation matters.</h2>
          <p>Record a discovery to see its journey here.</p>
          <Link className="button" to="/scan">
            Discover Something New
          </Link>
        </div>
      )}
      <div className="info-card">
        <Leaf />
        <div>
          <h3>How your observations could help</h3>
          <p>
            Structured records can support distribution studies, seasonal
            monitoring and repeated habitat observations when methods and
            quality are appropriate. Counts alone do not demonstrate
            conservation outcomes.
          </p>
        </div>
      </div>
      <Link className="inline-card" to="/sites">
        <RefreshCw /> Observe Again <ChevronRight />
      </Link>
      {o && <ObservationDetails o={o} onClose={() => setSelected("")} />}
    </>
  );
}
