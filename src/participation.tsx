import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  Compass,
  FlaskConical,
  Flower2,
  Layers,
  Leaf,
  Lock,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TreePine,
  Trophy,
  UserRound,
} from "lucide-react";
import { useApp, draftKey } from "./context";
import {
  activeConsent,
  repository,
  emptyState,
  makeConsent,
  seedState,
  speciesIds,
  characterProgress,
} from "./store";
import { species } from "./data";
import { config } from "./config";
import { Creature, Landscape } from "./Art";
import { Button, Heading, Modal, Pill } from "./ui";
export function Welcome() {
  const { state } = useApp();
  const n = useNavigate();
  const [tour, setTour] = useState(false);
  if (activeConsent(state)) return <Navigate to="/home" replace />;
  return (
    <main className="welcome">
      <div className="welcome-logo">
        <Leaf />
        {config.name}
        <small>FIND THE WILD. KEEP THE WONDER.</small>
      </div>
      <div className="welcome-art">
        <Landscape>
          <Creature kind={0} />
          <span className="floating-note">
            <Sparkles size={15} /> A little wonder, everywhere.
          </span>
        </Landscape>
      </div>
      <p className="eyebrow">YOUR NEXT CHAPTER STARTS OUTSIDE</p>
      <h1>
        There’s a whole world waiting to be <em>discovered.</em>
      </h1>
      <p>
        Explore nature, discover species, collect curious companions, and
        contribute to biodiversity research.
      </p>
      <Button onClick={() => n("/consent")}>
        Get Started <ArrowRight size={19} />
      </Button>
      <Button secondary onClick={() => setTour(true)}>
        Take a quick tour <Compass size={18} />
      </Button>
      <small className="footnote">
        No account needed. An adult demonstration profile.
        <br />
        Research agreement required to participate.
      </small>
      {tour && (
        <Modal title="Curiosity has a purpose." onClose={() => setTour(false)}>
          <div className="info-row">
            <Compass />
            <div>
              <h3>Discover nature</h3>
              <p>Photograph and learn about life around you.</p>
            </div>
          </div>
          <div className="info-row">
            <Sparkles />
            <div>
              <h3>Collect and learn</h3>
              <p>Every species has a fictional companion.</p>
            </div>
          </div>
          <div className="info-row">
            <FlaskConical />
            <div>
              <h3>Contribute to research</h3>
              <p>
                Submitted records join a controlled research dataset. This
                prototype keeps everything on your device.
              </p>
            </div>
          </div>
          <Button onClick={() => n("/consent")}>
            Review participation agreement <ArrowRight size={18} />
          </Button>
        </Modal>
      )}
    </main>
  );
}
export function ConsentPage() {
  const { state, setState } = useApp();
  const n = useNavigate();
  const [agree, setAgree] = useState(false);
  const [adult, setAdult] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [deleteData, setDeleteData] = useState(false);
  const [startMode, setStartMode] = useState(state.startMode);
  return (
    <main className="consent-page">
      <Link to="/" className="text-link">
        <ArrowLeft size={17} /> Welcome
      </Link>
      <div className="round-icon">
        <ShieldCheck />
      </div>
      <Heading
        eyebrow="PARTICIPATION AGREEMENT · VERSION 1.1"
        title="Help Nature. Help Research."
        sub="Your curiosity can help build a clearer picture of the natural world."
      />
      <p>
        Join Wilsee with an informed participation agreement. Discoveries stay
        in your private journal. Only observations you explicitly choose to
        submit enter the local research demonstration.
      </p>
      <div className="info-row">
        <Camera />
        <div>
          <h3>Your Discoveries</h3>
          <p>
            Organism photographs, identification suggestions, dates, observation
            locations and survey details.
          </p>
        </div>
      </div>
      <div className="info-row">
        <FlaskConical />
        <div>
          <h3>For Biodiversity Research</h3>
          <p>
            Only explicitly submitted observations would be available to
            authorised academic, conservation and approved project research
            teams for legitimate biodiversity studies.
          </p>
        </div>
      </div>
      <div className="info-row">
        <Lock />
        <div>
          <h3>Your Privacy Matters</h3>
          <p>
            Your collection is private. Research records have controlled access;
            sensitive locations need additional restrictions.
          </p>
        </div>
      </div>
      <details>
        <summary>What information will researchers receive?</summary>
        <p>
          When you confirm a research submission: organism photos,
          identification and uncertainty, observation dates and times, location
          and precision, survey effort, habitat, behaviour, notes and a
          pseudonymous contributor ID. Personal collections and game profiles
          are not public research records.
        </p>
        <p>
          Production access would be limited to approved researchers under
          project permissions. Sensitive coordinates and photo metadata require
          protection. No advertising or unrelated commercial use is included.
        </p>
        <p>
          Review or correct records in My Contributions. In this local
          prototype, delete a record or reset data to remove it. Withdraw under
          Profile to stop future participation. In production, access,
          correction and withdrawal requests would follow project retention
          agreements; withdrawal cannot automatically recall data already
          lawfully used in completed research.
        </p>
        <p>
          Declining means you cannot enter the observation platform. You can
          reconsider later. This is a consent-control demonstration, not a
          legally certified policy or live research programme.
        </p>
      </details>
      {!state.observations.length && (
        <fieldset className="explorer-choice">
          <legend>Your first adventure</legend>
          <label className={startMode === "demo" ? "chosen" : ""}>
            <input
              type="radio"
              name="start-mode"
              value="demo"
              checked={startMode === "demo"}
              onChange={() => setStartMode("demo")}
            />
            <span>
              <strong>
                Demo Explorer <Pill>RECOMMENDED</Pill>
              </strong>
              <small>
                24 fictional observations, 6 companions, 8 sites and living
                biomes. Ready to present.
              </small>
            </span>
          </label>
          <label className={startMode === "fresh" ? "chosen" : ""}>
            <input
              type="radio"
              name="start-mode"
              value="fresh"
              checked={startMode === "fresh"}
              onChange={() => setStartMode("fresh")}
            />
            <span>
              <strong>Fresh Explorer</strong>
              <small>
                Start an empty journal and make your own discoveries.
              </small>
            </span>
          </label>
        </fieldset>
      )}
      <label className="checkbox">
        <input
          type="checkbox"
          checked={adult}
          onChange={(e) => setAdult(e.target.checked)}
        />
        <span>I am using the adult (18+) demonstration profile.</span>
      </label>
      <details>
        <summary>Guardian pathway · future concept</summary>
        <p>
          Minors cannot activate research participation in this prototype. A
          verified guardian process, age-appropriate information and separate
          location safeguards would be required before a real child account
          could participate.
        </p>
      </details>
      <label className="checkbox consent-check">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>
          I understand that the biodiversity observations I explicitly choose to
          submit, including relevant photographs, dates, locations and
          observation details, will be processed and shared with authorised
          researchers for the research purposes explained above. This prototype
          simulates that process locally.
        </span>
      </label>
      <Button
        disabled={!agree || !adult || state.recoveryRequired}
        onClick={() => {
          setState((s) => {
            const next = {
              ...s,
              startMode,
              consents: [...s.consents, makeConsent(true)],
            };
            return !s.observations.length && startMode === "demo"
              ? seedState(next)
              : next;
          });
          n("/home");
        }}
      >
        I Agree — Start Exploring <ArrowRight size={18} />
      </Button>
      <Button
        secondary
        onClick={() => {
          setState((s) => ({
            ...s,
            consents: [...s.consents, makeConsent(false)],
          }));
          setDeclined(true);
        }}
      >
        I Do Not Agree
      </Button>
      {declined && (
        <div className="notice" role="status">
          Your choice has been saved. Participation requires the research
          agreement, so the observation platform remains closed. You can review
          and reconsider here whenever you like.
        </div>
      )}
      {activeConsent(state) && (
        <Link className="text-link" to="/profile">
          Return to your profile
        </Link>
      )}
      {state.observations.length > 0 && !state.recoveryRequired && (
        <>
          <p className="footnote">
            Your existing private journal is retained while participation is
            closed. You may delete it without accepting a new agreement.
          </p>
          <Button secondary onClick={() => setDeleteData(true)}>
            Delete My Local Data
          </Button>
        </>
      )}
      {deleteData && (
        <Modal
          title="Delete your local Wilsee data?"
          onClose={() => setDeleteData(false)}
        >
          <p>
            This removes this browser’s observations, photographs, permissions
            and game progress. It cannot be undone.
          </p>
          <Button
            onClick={() => {
              sessionStorage.removeItem(draftKey);
              repository.save(emptyState("fresh"));
              window.location.assign("/");
            }}
          >
            Confirm Delete My Local Data
          </Button>
          <Button secondary onClick={() => setDeleteData(false)}>
            Keep My Data
          </Button>
        </Modal>
      )}
    </main>
  );
}
export function Profile() {
  const { state, setState, toast } = useApp();
  const n = useNavigate();
  const [confirm, setConfirm] = useState("");
  const ids = speciesIds(state);
  const c = activeConsent(state);
  const achievements = [
    ["First Discovery", ids.length > 0, Leaf],
    [
      "Bird Explorer",
      ids.filter((id) => species[id].category === "Birds").length >= 2,
      Compass,
    ],
    ["Pollinator Pal", ids.includes(3), Flower2],
    ["Curious Naturalist", ids.length >= 3, BookOpen],
    [
      "Habitat Helper",
      state.claimed.some((id) => ["tree", "birds"].includes(id)),
      TreePine,
    ],
  ] as const;
  return (
    <>
      <Heading
        eyebrow="YOUR EXPLORER PASSPORT"
        title="Nature Scout"
        sub="A little more curious, every day."
        back
      />
      <div className="profile-card">
        <div className="profile-avatar">
          <UserRound size={42} />
        </div>
        <Pill>ADULT DEMONSTRATION PROFILE</Pill>
        <h2>Level {1 + Math.floor(state.xp / 100)}</h2>
        <p>
          {state.xp} XP · {100 - (state.xp % 100)} XP to your next level
        </p>
        <div className="progress">
          <span style={{ width: (state.xp % 100) + "%" }} />
        </div>
      </div>
      <div className="stat-grid">
        <div>
          <strong>{ids.length}</strong>
          <span>species</span>
        </div>
        <div>
          <strong>{state.observations.length}</strong>
          <span>observations</span>
        </div>
        <div>
          <strong>{state.claimed.length}</strong>
          <span>tasks</span>
        </div>
      </div>
      <div className="section-title">
        <h2>A passport to wonder</h2>
        <Trophy size={20} />
      </div>
      {state.game.activeCompanionId !== null &&
        ids.includes(state.game.activeCompanionId) && (
          <Link
            className="inline-card profile-companion"
            to={"/character/" + state.game.activeCompanionId}
          >
            <Creature
              kind={state.game.activeCompanionId}
              stage={
                characterProgress(state, state.game.activeCompanionId).stage
              }
            />
            <span>
              <strong>{species[state.game.activeCompanionId].pet}</strong>
              <small>
                Your active companion · Level{" "}
                {characterProgress(state, state.game.activeCompanionId).level} ·
                Stage{" "}
                {characterProgress(state, state.game.activeCompanionId).stage}
              </small>
            </span>
            <ArrowRight size={18} />
          </Link>
        )}
      <div className="badges">
        {achievements.map(([name, unlocked, Icon]) => (
          <div key={name} className={unlocked ? "earned" : ""}>
            <Icon size={29} />
            <strong>{name}</strong>
            <small>{unlocked ? "Unlocked" : "Keep exploring"}</small>
          </div>
        ))}
      </div>
      <div className="section-title">
        <h2>Privacy & participation</h2>
        <ShieldCheck size={20} />
      </div>
      <div className="settings">
        <p>
          <Lock size={17} /> Collections and observation history are private.
        </p>
        <p>
          <FlaskConical size={17} /> Research submissions need a separate,
          informed confirmation.
        </p>
        <p>
          <MapPin size={17} /> No background tracking or public coordinates.
        </p>
        <p>
          <ShieldCheck size={17} /> All demo data stays in this browser.
        </p>
      </div>
      <details>
        <summary>Review your participation agreement</summary>
        <p>
          Consent version {c?.version} · recorded{" "}
          {c ? new Date(c.timestamp).toLocaleString("en-AU") : ""}
        </p>
        <p>{c?.scope}</p>
        <p>
          Correct records in My Contributions. Withdraw below to stop future
          participation. Production withdrawal follows project retention
          arrangements and cannot automatically recall data already lawfully
          used in completed research.
        </p>
        <Link className="text-link" to="/consent">
          Read complete explanation <ArrowRight size={16} />
        </Link>
      </details>
      <Button secondary onClick={() => setConfirm("withdraw")}>
        Withdraw from Future Participation
      </Button>
      <div className="section-title">
        <h2>Presentation controls</h2>
        <SlidersHorizontal size={20} />
      </div>
      <p className="muted">
        Current mode: {state.mode}. Demo Explorer replaces observations with
        labelled sample records. Consent remains your explicit decision.
      </p>
      <Button onClick={() => setConfirm("demo")}>Load Demo Explorer</Button>
      <Button secondary onClick={() => setConfirm("reset")}>
        Fresh Explorer · Reset Demo
      </Button>
      <Link className="inline-card" to="/researcher-demo">
        <FlaskConical /> Researcher Demonstration <ArrowUpRight />
      </Link>
      <Link className="text-link" to="/credits">
        Photography credits &amp; licences <ArrowUpRight size={15} />
      </Link>
      <Link className="inline-card" to="/showcase">
        <Layers /> Presentation Showcase <ArrowUpRight />
      </Link>
      {confirm && (
        <Modal
          title={
            confirm === "withdraw"
              ? "Withdraw participation?"
              : confirm === "demo"
                ? "Load sample explorer?"
                : "Start a fresh adventure?"
          }
          onClose={() => setConfirm("")}
        >
          <p>
            {confirm === "withdraw"
              ? "This stops further participation, closes the observation app and removes records from research views. Your private journal is retained. You can delete local data from the agreement screen without accepting again. No data has been sent outside this prototype."
              : confirm === "demo"
                ? "This replaces local observation progress with labelled samples and a populated ecosystem. Your consent is preserved."
                : "This deletes all local observations, photographs, consent records and game progress, then returns to the welcome screen."}
          </p>
          <Button
            onClick={() => {
              if (confirm === "withdraw") {
                setState((s) => ({
                  ...s,
                  consents: s.consents.map((x) =>
                    x.id === c?.id
                      ? { ...x, withdrawnAt: new Date().toISOString() }
                      : x,
                  ),
                }));
                n("/consent");
                toast(
                  "Participation withdrawn. Future observation saving is blocked.",
                );
              } else if (confirm === "demo") {
                setState(seedState(state));
                toast("Labelled sample explorer loaded.");
              } else {
                sessionStorage.removeItem(draftKey);
                const cleared = emptyState("fresh");
                repository.save(cleared);
                setState(cleared);
                window.location.assign("/");
              }
              setConfirm("");
            }}
          >
            {confirm === "withdraw"
              ? "Withdraw"
              : confirm === "demo"
                ? "Load Demo Records"
                : "Reset Local Data"}
          </Button>
          <Button secondary onClick={() => setConfirm("")}>
            Cancel
          </Button>
        </Modal>
      )}
    </>
  );
}
