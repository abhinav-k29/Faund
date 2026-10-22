import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Compass,
  FlaskConical,
  Flower2,
  Info,
  Leaf,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Target,
  TreePine,
} from "lucide-react";
import { useApp } from "./context";
import { speciesIds, taskProgress, Task, characterProgress } from "./store";
import { species } from "./data";
import { Creature, Landscape } from "./Art";
import { Button, Heading, Modal, Pill, Photo, dateLabel } from "./ui";
export function World({ large = false }: { large?: boolean }) {
  const { state } = useApp();
  const ids = state.ecosystem.filter((id) => speciesIds(state).includes(id));
  return (
    <div className={"world " + (large ? "large-world" : "")}>
      <Landscape richness={ids.length}>
        {ids.slice(0, 5).map((id, i) => (
          <Link
            className={"world-pet pet-" + i}
            key={id}
            to={"/card/" + id + "?side=character"}
            aria-label={`Meet ${species[id].pet}`}
          >
            <Creature kind={id} />
          </Link>
        ))}
        {ids.length === 0 && (
          <span className="world-empty">A little room to grow.</span>
        )}
      </Landscape>
    </div>
  );
}
export function Home() {
  const { state } = useApp();
  const ids = speciesIds(state);
  const task = state.tasks.find(
    (t) => t.status === "Published" && t.type === "Research",
  );
  return (
    <>
      <div className="greeting">
        <p className="eyebrow">THE WILD MISSED YOU. MAYBE.</p>
        <h1>
          Hey, Explorer<span className="coral">.</span>
        </h1>
        <p>What will you discover today?</p>
        <Pill>
          LVL {String(1 + Math.floor(state.xp / 100)).padStart(2, "0")} · Nature
          Scout
        </Pill>
        <Link className="home-tasks-pill" to="/tasks">
          <Target size={15} /> Tasks
        </Link>
      </div>
      <section className="world-card">
        <div className="section-mini">
          <span>
            <span className="live-dot" /> MY LIVING WORLD
          </span>
          <Sparkles size={17} />
        </div>
        <World />
        <div className="world-caption">
          <div>
            <h2>Your world is growing.</h2>
            <p>Every discovery adds a little life.</p>
          </div>
          <Link
            className="circle-link"
            to="/ecosystem"
            aria-label="Visit my ecosystem"
          >
            <ArrowUpRight />
          </Link>
        </div>
        <div className="world-stats">
          <span>
            <strong>{ids.length}</strong> species discovered
          </span>
          <span>
            <strong>{ids.length}</strong> companions unlocked
          </span>
        </div>
      </section>
      <Link to="/scan" className="discovery-cta">
        <span className="camera-disc">
          <Camera size={25} />
        </span>
        <div>
          <h3>Discover Something New</h3>
          <p>Your next discovery might be right outside.</p>
        </div>
        <ArrowUpRight size={22} />
      </Link>
      <Link className="home-tasks-shortcut" to="/tasks">
        <span>
          <Target size={22} />
        </span>
        <div>
          <h3>Tasks & Research Missions</h3>
          <p>Follow a field protocol. Help build a useful record.</p>
        </div>
        <ChevronRight size={19} />
      </Link>
      <div className="section-title">
        <h2>A little adventure?</h2>
        <Link to="/tasks">
          All tasks <ArrowRight size={15} />
        </Link>
      </div>
      {task && (
        <Link to="/tasks" className="task-feature">
          <div className="task-art">
            <TreePine size={38} />
            <span className="mini-star">✦</span>
          </div>
          <div>
            <Pill>RESEARCH TASK</Pill>
            <h3>{task.title}</h3>
            <p>Same tree. A new chapter.</p>
            <span className="reward">
              +{task.reward} XP <ArrowRight size={15} />
            </span>
          </div>
        </Link>
      )}
      <div className="section-title">
        <h2>Fresh from your journal</h2>
        <Link to="/collection">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      {ids.length ? (
        <Link to={"/card/" + ids[0]} className="recent">
          <Photo id={ids[0]} />
          <div>
            <span className="eyebrow">A RECENT DISCOVERY</span>
            <h3>{species[ids[0]].name}</h3>
            <p>One species. Another side.</p>
          </div>
          <Creature kind={ids[0]} />
        </Link>
      ) : (
        <div className="empty small">
          <Leaf />
          <h3>Make room for your first discovery.</h3>
          <p>A whole world out there. Start with one little thing.</p>
        </div>
      )}
      <Link to="/contributions" className="research-callout">
        <div>
          <FlaskConical size={21} />
          <span className="eyebrow">CURIOSITY, WITH PURPOSE</span>
        </div>
        <h2>
          Little discoveries.
          <br />
          Bigger questions.
        </h2>
        <p>
          {state.observations.length} observations in your local research
          dataset.
        </p>
        <span>
          See My Contributions <ArrowRight size={17} />
        </span>
      </Link>
      <p className="footnote">
        Concept prototype · all research activity is local and simulated.
      </p>
    </>
  );
}
export function Collection() {
  const { state } = useApp();
  const [tab, setTab] = useState("Species");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const ids = speciesIds(state);
  const filtered = species.filter(
    (s) =>
      ids.includes(s.id) &&
      (category === "All" || s.category === category) &&
      (s.name + " " + s.pet).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="YOUR PRIVATE FIELD JOURNAL"
        title="My Collection"
        sub="Every discovery has a story."
      />
      <div className="tabs">
        {["Species", "Characters"].map((t) => (
          <button
            key={t}
            className={t === tab ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t === "Species" ? <BookOpen size={17} /> : <Sparkles size={17} />}{" "}
            {t === "Species" ? "Species Cards" : t}
            <span>{ids.length}</span>
          </button>
        ))}
      </div>
      <label className="search">
        <Search size={18} />
        <input
          aria-label="Search collection"
          placeholder="Find a little wonder…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="chips">
        {["All", "Birds", "Plants", "Insects", "Mammals", "Fungi"].map((c) => (
          <button
            key={c}
            className={c === category ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="collection-grid">
          {filtered.map((s) => (
            <Link
              key={s.id}
              className={
                "collection-tile collectible-preview " +
                (tab === "Characters" ? "companion-tile" : "")
              }
              style={{ "--card-color": s.color } as React.CSSProperties}
              to={(tab === "Characters" ? "/character/" : "/card/") + s.id}
            >
              <div className="mini-card-top">
                <span>NO. {String(s.id + 1).padStart(3, "0")}</span>
                <span>↔</span>
              </div>
              {state.observations.some(
                (o) =>
                  o.speciesId === s.id &&
                  !o.provenance.includes("Seeded") &&
                  Date.now() - Date.parse(o.createdAt) < 86400000,
              ) && <span className="new-card-label">RECENTLY FOUND</span>}
              {tab === "Characters" ? (
                <div className="tile-creature">
                  <Creature kind={s.id} />
                  <span>✦</span>
                </div>
              ) : (
                <Photo id={s.id} />
              )}
              <div className="tile-copy">
                <span className="eyebrow">
                  {tab === "Species" ? s.category : s.type}
                </span>
                <h3>{tab === "Species" ? s.name : s.pet}</h3>
                <p>
                  {
                    state.observations.filter((o) => o.speciesId === s.id)
                      .length
                  }{" "}
                  observations
                </p>
                {tab === "Species" ? (
                  <small>
                    First found{" "}
                    {dateLabel(
                      state.observations.find((o) => o.speciesId === s.id)!
                        .observedAt,
                    )}
                  </small>
                ) : (
                  <>
                    <small>
                      Level {characterProgress(state, s.id).level} · Stage{" "}
                      {characterProgress(state, s.id).stage} of 3
                    </small>
                    <div className="progress">
                      <span
                        style={{
                          width:
                            Math.min(
                              100,
                              characterProgress(state, s.id).growth / 3,
                            ) + "%",
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">
          <BookOpen />
          <h2>
            {ids.length
              ? "No little wonders here."
              : "Your adventure starts here."}
          </h2>
          <p>
            {ids.length
              ? "Try another search or category."
              : "There’s an entire world waiting to be discovered."}
          </p>
          <Link className="button" to="/scan">
            Start Exploring <ArrowRight size={18} />
          </Link>
        </div>
      )}
      <p className="privacy-line">
        <Lock size={14} /> Private collection · research records follow your
        agreement
      </p>
      {!search && category === "All" && ids.length < species.length && (
        <div className="locked-card-strip">
          {species
            .filter((s) => !ids.includes(s.id))
            .slice(0, 3)
            .map((s) => (
              <Link key={s.id} to="/field-guide">
                <span>NO. {String(s.id + 1).padStart(3, "0")}</span>
                <Lock size={22} />
                <small>Not yet discovered</small>
              </Link>
            ))}
        </div>
      )}
      <Link className="inline-card" to="/field-guide">
        <BookOpen /> Browse the Field Guide <ChevronRight />
      </Link>
      <Link className="inline-card" to="/contributions">
        <FlaskConical /> My Contributions <ChevronRight />
      </Link>
    </>
  );
}
export function Ecosystem() {
  const { state } = useApp();
  const ids = speciesIds(state);
  return (
    <>
      <Heading
        eyebrow="A LITTLE WORLD OF YOUR OWN"
        title="My Ecosystem"
        sub="Every discovery adds something to your world."
        back
      />
      <World large />
      <div className="ecosystem-caption">
        <Pill lavender>
          {ids.length === 0
            ? "A fresh beginning"
            : ids.length < 3
              ? "Taking root"
              : "A world in bloom"}
        </Pill>
        <h2>
          {ids.length === 0
            ? "Wonder starts with one discovery."
            : "Look what your curiosity grew."}
        </h2>
        <p>
          {state.ecosystem.length} companions at home · tap one to say hello.
        </p>
      </div>
      <div className="info-card">
        <Flower2 />
        <div>
          <h3>Flowering plants + pollinators</h3>
          <p>
            Many flowering plants rely on animals to carry pollen between
            flowers. Different lives, closely connected.
          </p>
        </div>
      </div>
      <p className="footnote">
        An illustrated collection of discoveries and learning. This fictional
        world is not a scientific model of ecosystem health.
      </p>
      <div className="section-title">
        <h2>Your companions</h2>
        <Link to="/collection">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      <div className="companion-strip">
        {ids.map((id) => (
          <Link key={id} to={"/card/" + id + "?side=character"}>
            <Creature kind={id} />
            <strong>{species[id].pet}</strong>
          </Link>
        ))}
      </div>
      <Link className="button" to="/scan">
        Grow your little world <Camera size={19} />
      </Link>
    </>
  );
}
export function Explore() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [habitat, setHabitat] = useState("");
  const filtered = species.filter(
    (s) =>
      (cat === "All" || s.category === cat) &&
      s.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="WONDER IS EVERYWHERE"
        title="Explore Nature"
        sub="Meet the life that makes this place alive."
      />
      <div className="explore-hero">
        <Photo id={1} />
        <div>
          <Pill>A FIELD GUIDE TO AUSTRALIA</Pill>
          <h2>
            Small bird.
            <br />
            Big personality.
          </h2>
          <Link to="/card/1">
            Meet the Superb Fairywren <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <div className="section-title">
        <h2>Explore a habitat</h2>
        <Compass size={20} />
      </div>
      <div className="habitats">
        {[
          ["Gardens", Flower2],
          ["Woodlands", TreePine],
          ["Wetlands", Leaf],
          ["Grasslands", Sun],
          ["Coastal habitats", Compass],
          ["Urban green spaces", MapPin],
        ].map(([h, Icon]) => {
          const I = Icon as typeof Leaf;
          return (
            <button key={String(h)} onClick={() => setHabitat(String(h))}>
              <I size={25} />
              <span>{String(h)}</span>
              <ArrowUpRight size={15} />
            </button>
          );
        })}
      </div>
      <div className="section-title">
        <h2>Wild around you</h2>
        <Pill>EXAMPLE SPECIES</Pill>
      </div>
      <p className="muted">
        An Australian field guide, not live nearby sightings. No location
        permission needed.
      </p>
      <label className="search">
        <Search size={18} />
        <input
          value={search}
          placeholder="Search the field guide"
          aria-label="Search species"
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="chips">
        {["All", "Birds", "Plants", "Insects"].map((x) => (
          <button
            className={x === cat ? "selected" : ""}
            key={x}
            onClick={() => setCat(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="collection-grid">
        {filtered.map((s) => (
          <Link className="collection-tile" key={s.id} to={"/card/" + s.id}>
            <Photo id={s.id} />
            <div className="tile-copy">
              <span className="eyebrow">{s.category}</span>
              <h3>{s.name}</h3>
              <p>{s.habitat}</p>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty">
          <Search />
          <h3>No species match that search.</h3>
        </div>
      )}
      {habitat && (
        <Modal title={habitat} onClose={() => setHabitat("")}>
          <div className="habitat-art">
            <Landscape />
          </div>
          <p>
            {habitat === "Gardens"
              ? "Flowering plants offer food for flower visitors. Observe gently without picking flowers."
              : habitat === "Woodlands"
                ? "Trees, shrubs and the ground layer provide different habitats. Look and listen from a public path."
                : habitat === "Wetlands"
                  ? "Water, reeds and changing seasons create diverse habitats. Stay on designated paths and keep clear of wildlife."
                  : `Explore ${habitat.toLowerCase()} from safe public places. Look for relationships between plants, animals and their surroundings.`}
          </p>
          <p>This is educational example content, not live local sightings.</p>
          <Link className="button" to="/tasks">
            Find an exploration task <ArrowRight size={18} />
          </Link>
        </Modal>
      )}
    </>
  );
}
export function Tasks() {
  const { state, setState, setDraft, toast } = useApp();
  const [filter, setFilter] = useState("All");
  const [detail, setDetail] = useState<Task | null>(null);
  const n = useNavigate();
  return (
    <>
      <Heading
        eyebrow="A LITTLE CURIOSITY GOES A LONG WAY"
        title="Your Tasks"
        sub="Small adventures. Bigger questions."
      />
      <div className="task-banner">
        <Target size={29} />
        <div>
          <h3>Find your next reason to head outside.</h3>
          <p>
            {state.claimed.length} completed ·{" "}
            {state.tasks.filter((t) => t.status === "Published").length}{" "}
            available tasks
          </p>
        </div>
      </div>
      <div className="chips">
        {["All", "Exploration", "Research"].map((x) => (
          <button
            key={x}
            className={filter === x ? "selected" : ""}
            onClick={() => setFilter(x)}
          >
            {x === "All" ? "All tasks" : x + " Tasks"}
          </button>
        ))}
      </div>
      <div className="task-list">
        {state.tasks
          .filter(
            (t) =>
              t.status === "Published" &&
              (filter === "All" || filter === t.type),
          )
          .map((t) => {
            const progress = taskProgress(t, state);
            const claimed = state.claimed.includes(t.id);
            return (
              <article
                key={t.id}
                className={
                  "task-card " + (t.type === "Research" ? "research-task" : "")
                }
              >
                <div className="task-card-head">
                  <div className="task-icon">
                    {t.type === "Research" ? <FlaskConical /> : <Compass />}
                  </div>
                  <Pill>{t.type.toUpperCase()}</Pill>
                  <span className="reward">+{t.reward} XP</span>
                </div>
                <h2>{t.title}</h2>
                <p>{t.question}</p>
                <div className="progress">
                  <span style={{ width: progress * 100 + "%" }} />
                </div>
                <div className="progress-label">
                  <span>
                    {claimed
                      ? "Reward collected"
                      : progress === 1
                        ? "Ready to complete"
                        : "Your adventure is underway"}
                  </span>
                  <b>{Math.round(progress * 100)}%</b>
                </div>
                {progress === 1 ? (
                  <Button
                    secondary
                    disabled={claimed}
                    onClick={() => {
                      setState((s) =>
                        s.claimed.includes(t.id)
                          ? s
                          : {
                              ...s,
                              claimed: [...s.claimed, t.id],
                              xp: s.xp + t.reward,
                              game: {
                                ...s.game,
                                availableGrowthXP:
                                  s.game.availableGrowthXP + t.reward,
                              },
                            },
                      );
                      toast("Task completed. Nature noticed. Probably.");
                    }}
                  >
                    {claimed ? (
                      <>
                        <Check size={17} /> Completed
                      </>
                    ) : (
                      "Collect Reward"
                    )}
                  </Button>
                ) : (
                  <Button secondary onClick={() => setDetail(t)}>
                    View Task <ArrowRight size={17} />
                  </Button>
                )}
                <button
                  className="task-protocol-link text-link"
                  onClick={() => setDetail(t)}
                >
                  Read Protocol <BookOpen size={15} />
                </button>
              </article>
            );
          })}
      </div>
      <p className="footnote">
        Rewards recognise participation, not scientific accuracy. All saved
        observations enter the local research dataset.
      </p>
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <Pill>{detail.type} · local demonstration</Pill>
          <h3>Research question</h3>
          <p>{detail.question}</p>
          <h3>How to take part</h3>
          <p>{detail.instructions}</p>
          {detail.projectId && (
            <p className="task-project-label">
              Project:{" "}
              {state.projects.find((p) => p.id === detail.projectId)?.title ||
                "Research demonstration"}
            </p>
          )}
          <dl className="metadata">
            <dt>Region</dt>
            <dd>{detail.region}</dd>
            <dt>Target</dt>
            <dd>{detail.target}</dd>
            <dt>Effort</dt>
            <dd>{detail.duration} minutes</dd>
            <dt>Record</dt>
            <dd>{detail.requiredFields}</dd>
            <dt>Repeat visits</dt>
            <dd>
              {detail.repeatVisits || 1} visit
              {(detail.repeatVisits || 1) > 1 ? "s at the same named site" : ""}
            </dd>
          </dl>
          <div className="notice">{detail.safety}</div>
          <p>
            Consistent methods and effort help interpret observations. No real
            research team receives these records.
          </p>
          <Button
            onClick={() => {
              setDraft({ taskId: detail.id });
              n("/scan");
            }}
          >
            Start Task <Camera size={18} />
          </Button>
        </Modal>
      )}
    </>
  );
}
export function Sites() {
  const { state, setDraft } = useApp();
  const n = useNavigate();
  const loc = useLocation();
  const [selected, setSelected] = useState(
    new URLSearchParams(loc.search).get("site") || "",
  );
  const [comparison, setComparison] = useState(50);
  const site = state.sites.find((s) => s.id === selected);
  const visits = state.observations
    .filter((o) => o.siteId === selected)
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  return (
    <>
      <Heading
        eyebrow="SAME PLACE. ANOTHER CHAPTER."
        title="Observe Again"
        sub="Small changes become a longer story."
        back
      />
      {state.sites.map((site) => {
        const visits = state.observations
          .filter((o) => o.siteId === site.id)
          .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
        return (
          <article key={site.id} className="site-card">
            <div className="site-illustration">
              <TreePine size={56} />
              <span>{visits.length} visits</span>
            </div>
            <h2>{site.name}</h2>
            <p>{site.location} · private site</p>
            <p>
              First:{" "}
              {visits.length ? dateLabel(visits[0].observedAt) : "No visits"}
              <br />
              Latest:{" "}
              {visits.length
                ? dateLabel(visits[visits.length - 1].observedAt)
                : "No visits"}
            </p>
            <Button
              onClick={() => {
                setDraft({ siteId: site.id, taskId: "tree" });
                n("/scan");
              }}
            >
              Record New Visit <Camera size={18} />
            </Button>
            <Button secondary onClick={() => setSelected(site.id)}>
              View Observation Timeline <ArrowRight size={17} />
            </Button>
          </article>
        );
      })}
      {!state.sites.length && (
        <div className="empty">
          <TreePine />
          <h2>A place worth returning to.</h2>
          <p>Save a named site while recording your next observation.</p>
          <Link className="button" to="/scan">
            Make a discovery
          </Link>
        </div>
      )}
      <div className="info-card">
        <Info />
        <p>
          Repeated observations may support monitoring when location, methods
          and effort are sufficiently consistent. Visible changes require
          context and expert interpretation.
        </p>
      </div>
      {site && (
        <Modal title={site.name} onClose={() => setSelected("")}>
          <div className="comparison">
            <div className="comparison-after">
              <Landscape />
            </div>
            <div
              className="comparison-before"
              style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
            >
              <Landscape />
            </div>
            <div
              className="comparison-line"
              style={{ left: comparison + "%" }}
            />
            <span className="before-label">EARLIER · CONCEPT ART</span>
            <span className="after-label">LATER · CONCEPT ART</span>
          </div>
          <label>
            Compare illustrative vegetation appearance
            <input
              type="range"
              min="0"
              max="100"
              value={comparison}
              onChange={(e) => setComparison(Number(e.target.value))}
            />
          </label>
          <p className="footnote">
            Stylised example art, not measured change or photos from these
            visits. No claim of biodiversity decline.
          </p>
          <div className="timeline">
            {visits.map((o) => (
              <div key={o.id}>
                <span className="timeline-dot" />
                <strong>{dateLabel(o.observedAt)}</strong>
                <p>
                  {o.speciesId === null
                    ? "Unidentified"
                    : species[o.speciesId].name}{" "}
                  · {o.duration} min
                </p>
                <p>{o.notes}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
