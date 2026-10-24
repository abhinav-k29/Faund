import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  Download,
  FlaskConical,
  Info,
  Layers,
  Leaf,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { useApp } from "./context";
import { Task, Observation, csvText, authorisedObservations } from "./store";
import { species } from "./data";
import { config } from "./config";
import { Creature } from "./Art";
import { World } from "./pages";
import { ObservationDetails } from "./observations";
import { SpeciesCard } from "./cards";
import { Button, Logo, Modal, Pill, Photo, dateLabel } from "./ui";
import { ResearchProjects, ResearchMonitoring } from "./research-projects";
function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Researcher() {
  const { state, setState, toast } = useApp();
  const [view, setView] = useState(
    new URLSearchParams(location.search).get("view") === "projects"
      ? "Research Projects"
      : "Overview",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [review, setReview] = useState("All");
  const [task, setTask] = useState("All");
  const [method, setMethod] = useState("All");
  const [area, setArea] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState("");
  const [edit, setEdit] = useState<Task | null>(null);
  const [taxon, setTaxon] = useState("All");
  const [certainty, setCertainty] = useState("All");
  const [maxUncertainty, setMaxUncertainty] = useState("");
  const [limit, setLimit] = useState(50);
  useEffect(
    () => setLimit(50),
    [
      query,
      category,
      review,
      task,
      method,
      area,
      from,
      to,
      taxon,
      certainty,
      maxUncertainty,
    ],
  );
  const authorised = authorisedObservations(state);
  const rows = authorised.filter((o) => {
    const s = o.speciesId === null ? null : species[o.speciesId];
    return (
      (!query ||
        (s?.name + " " + s?.latin + " " + o.id)
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (category === "All" ||
        (o.speciesId === null
          ? category === "Unidentified"
          : s?.category === category)) &&
      (taxon === "All" || String(o.speciesId) === taxon) &&
      (certainty === "All" ||
        (certainty === "Unconfirmed"
          ? o.speciesId === null
          : o.speciesId !== null)) &&
      (!maxUncertainty || o.uncertainty <= Number(maxUncertainty)) &&
      (review === "All" || o.review === review) &&
      (task === "All" || o.taskId === task) &&
      (method === "All" || o.method === method) &&
      (!area ||
        (!o.sensitive &&
          o.location.toLowerCase().includes(area.toLowerCase()))) &&
      (!from || o.observedAt.slice(0, 10) >= from) &&
      (!to || o.observedAt.slice(0, 10) <= to)
    );
  });
  const categories = ["Birds", "Plants", "Insects", "Unidentified"];
  const catCount = (c: string) =>
    rows.filter((o) =>
      o.speciesId === null
        ? c === "Unidentified"
        : species[o.speciesId].category === c,
    ).length;
  const dates = [...new Set(rows.map((o) => o.observedAt.slice(0, 7)))].sort();
  const sites = [
    ...new Set(rows.map((o) => (o.sensitive ? "Restricted area" : o.location))),
  ];
  const selectedObs = authorised.find((o) => o.id === selected);
  return (
    <div className="research-layout">
      <aside className="research-sidebar">
        <Logo />
        <p className="eyebrow">RESEARCH WORKSPACE</p>
        {[
          "Overview",
          "Observations",
          "Research Tasks",
          "Research Projects",
          "Site Monitoring",
        ].map((v) => (
          <button
            key={v}
            className={view === v ? "selected" : ""}
            onClick={() => setView(v)}
          >
            {v === "Overview" ? (
              <Layers size={20} />
            ) : v === "Observations" ? (
              <BookOpen size={20} />
            ) : (
              <Target size={20} />
            )}{" "}
            {v}
          </button>
        ))}
        <div className="sidebar-bottom">
          <span>
            <span className="live-dot" /> Local demonstration
          </span>
          <Link to="/home">
            <ArrowLeft size={16} /> Explorer app
          </Link>
          <Link to="/showcase">
            <ArrowUpRight size={16} /> Showcase
          </Link>
        </div>
      </aside>
      <main className="research-main">
        <header className="research-header">
          <div>
            <p className="eyebrow">NATURE, THROUGH A CLEARER LENS</p>
            <h1>
              {view === "Research Projects"
                ? "Research Projects"
                : view === "Site Monitoring"
                  ? "Site Monitoring"
                  : view === "Research Tasks"
                    ? "Research tasks"
                    : view === "Observations"
                      ? "Observation library"
                      : "Researcher Demonstration"}
            </h1>
            <p>
              Community curiosity. Structured observations. Better questions.
            </p>
          </div>
          <div className="research-user">
            <span className="avatar">
              <FlaskConical size={22} />
            </span>
            <div>
              <strong>Demo Researcher</strong>
              <small>Local workspace · no authentication</small>
            </div>
          </div>
        </header>
        <div className="demo-banner">
          <Info size={20} />
          <span>
            Local research pipeline simulation. All records are demonstration
            data in this browser. Reviews are simulated; nothing is transmitted
            to researchers.
          </span>
        </div>
        {view === "Research Projects" ? (
          <ResearchProjects
            onRecords={(id) => {
              setTask(id);
              setView("Observations");
            }}
          />
        ) : view === "Site Monitoring" ? (
          <ResearchMonitoring rows={authorised} onInspect={setSelected} />
        ) : view === "Research Tasks" ? (
          <>
            <div className="section-title">
              <h2>Questions that begin outside.</h2>
              <span>
                {state.tasks.filter((t) => t.type === "Research").length}{" "}
                demonstration protocols
              </span>
            </div>
            <div className="research-task-grid">
              {state.tasks
                .filter((t) => t.type === "Research")
                .map((t) => (
                  <article className="task-card research-task" key={t.id}>
                    <div className="task-card-head">
                      <FlaskConical />
                      <Pill>{t.status}</Pill>
                    </div>
                    <h2>{t.title}</h2>
                    <p>{t.question}</p>
                    <p>{t.instructions}</p>
                    <dl className="metadata">
                      <dt>Duration</dt>
                      <dd>{t.duration} min</dd>
                      <dt>Region</dt>
                      <dd>{t.region}</dd>
                      <dt>Linked records</dt>
                      <dd>
                        {authorised.filter((o) => o.taskId === t.id).length}
                      </dd>
                    </dl>
                    <Button secondary onClick={() => setEdit({ ...t })}>
                      Edit Demo Task <ArrowRight size={18} />
                    </Button>
                    <button
                      className="text-link"
                      onClick={() => {
                        setTask(t.id);
                        setView("Observations");
                      }}
                    >
                      View Linked Observations <ArrowRight size={15} />
                    </button>
                  </article>
                ))}
            </div>
          </>
        ) : (
          <>
            <div className="research-stats">
              {[
                ["Total observations", rows.length, BookOpen],
                [
                  "Species recorded",
                  new Set(
                    rows.map((o) => o.speciesId).filter((x) => x !== null),
                  ).size,
                  Leaf,
                ],
                [
                  "Observation sites",
                  new Set(rows.map((o) => o.siteId).filter(Boolean)).size,
                  MapPin,
                ],
                [
                  "Awaiting review",
                  rows.filter((o) => o.review === "Awaiting review").length,
                  Search,
                ],
                [
                  "Active research tasks",
                  state.tasks.filter(
                    (t) => t.type === "Research" && t.status === "Published",
                  ).length,
                  Target,
                ],
              ].map(([label, num, Icon]) => {
                const I = Icon as typeof Leaf;
                return (
                  <div key={String(label)}>
                    <span>
                      {String(label)}
                      <I size={19} />
                    </span>
                    <strong>{String(num)}</strong>
                    <small>Local demonstration dataset</small>
                  </div>
                );
              })}
            </div>
            <section className="filter-panel">
              <div className="filter-label">
                <SlidersHorizontal size={18} />
                <strong>Explore the dataset</strong>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                    setReview("All");
                    setTask("All");
                    setMethod("All");
                    setArea("");
                    setFrom("");
                    setTo("");
                    setTaxon("All");
                    setCertainty("All");
                    setMaxUncertainty("");
                  }}
                >
                  Clear filters
                </button>
              </div>
              <div className="research-filters">
                <label className="search">
                  <Search size={17} />
                  <input
                    aria-label="Search observation records"
                    placeholder="Species, scientific name or record ID"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Filter category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All">All categories</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter species"
                  value={taxon}
                  onChange={(e) => setTaxon(e.target.value)}
                >
                  <option value="All">All species</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter identification uncertainty"
                  value={certainty}
                  onChange={(e) => setCertainty(e.target.value)}
                >
                  <option value="All">All identification states</option>
                  <option value="Unconfirmed">
                    Unconfirmed identification
                  </option>
                  <option value="Confirmed">User-confirmed demo</option>
                </select>
                <label className="uncertainty-filter">
                  Location uncertainty ≤ m
                  <input
                    type="number"
                    min="1"
                    placeholder="Any precision"
                    value={maxUncertainty}
                    onChange={(e) => setMaxUncertainty(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Filter review status"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                >
                  <option value="All">All review statuses</option>
                  {[
                    "Awaiting review",
                    "Demo reviewed",
                    "Needs clarification",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter task"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                >
                  <option value="All">All tasks</option>
                  {state.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="All">All methods</option>
                  {[
                    "Visual observation",
                    "Photo observation",
                    "Timed stationary survey",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  placeholder="Broad area"
                  aria-label="Filter area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
                <label className="date-filter">
                  From
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </label>
                <label className="date-filter">
                  To
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </label>
              </div>
            </section>
            {view === "Overview" && (
              <div className="charts-grid">
                <section className="chart-card">
                  <div className="section-title">
                    <h3>Observations over time</h3>
                    <Pill>MONTHLY</Pill>
                  </div>
                  <div className="bar-chart">
                    {dates.length ? (
                      dates.map((d) => {
                        const num = rows.filter((o) =>
                          o.observedAt.startsWith(d),
                        ).length;
                        return (
                          <div key={d}>
                            <strong>{num}</strong>
                            <span
                              style={{
                                height:
                                  Math.max(
                                    8,
                                    (num /
                                      Math.max(
                                        ...dates.map(
                                          (x) =>
                                            rows.filter((o) =>
                                              o.observedAt.startsWith(x),
                                            ).length,
                                        ),
                                      )) *
                                      130,
                                  ) + "px",
                              }}
                            />
                            <small>
                              {new Date(d + "-01").toLocaleDateString("en-AU", {
                                month: "short",
                                year: "2-digit",
                              })}
                            </small>
                          </div>
                        );
                      })
                    ) : (
                      <p>No observations yet.</p>
                    )}
                  </div>
                  <p className="footnote">
                    Counts do not establish population abundance or biodiversity
                    trends.
                  </p>
                </section>
                <section className="chart-card">
                  <h3>Species composition</h3>
                  <div className="composition">
                    {categories.map((c, i) => (
                      <div key={c}>
                        <span>
                          <i
                            style={{
                              background: [
                                "#406e5a",
                                "#b4ce7d",
                                "#a99cf4",
                                "#d4c9b5",
                              ][i],
                            }}
                          />
                          {c}
                          <b>{catCount(c)}</b>
                        </span>
                        <div className="progress">
                          <span
                            style={{
                              width:
                                (rows.length
                                  ? (catCount(c) / rows.length) * 100
                                  : 0) + "%",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="chart-card coverage">
                  <h3>Observation coverage</h3>
                  <div className="coverage-map">
                    <MapPin size={40} />
                    <span>GENERALISED AREAS</span>
                    <svg viewBox="0 0 300 80" aria-hidden="true">
                      <path
                        d="M0 40Q50 0 90 40T180 40T300 20M0 70Q60 30 110 70T220 70T300 50"
                        fill="none"
                        stroke="#c0d1bd"
                        strokeWidth="14"
                      />
                    </svg>
                  </div>
                  {sites.slice(0, 8).map((s) => (
                    <p key={s}>
                      <MapPin size={14} />
                      {s}
                      <strong>
                        {
                          rows.filter(
                            (o) =>
                              (o.sensitive ? "Restricted area" : o.location) ===
                              s,
                          ).length
                        }
                      </strong>
                    </p>
                  ))}
                  {sites.length > 8 && (
                    <p className="footnote">
                      Showing eight of {sites.length} generalised areas. Filter
                      observations to inspect another area.
                    </p>
                  )}
                </section>
              </div>
            )}
            <section className="table-card">
              <div className="table-title">
                <div>
                  <h2>Observation records</h2>
                  <p>
                    {rows.length} matching records · consent-linked demo data
                  </p>
                </div>
                <Button
                  secondary
                  disabled={!rows.length}
                  onClick={() => {
                    download(
                      csvText(rows),
                      "nature-discovery-observations.csv",
                      "text/csv;charset=utf-8",
                    );
                    toast(
                      `${rows.length} records exported. Coordinates omitted; sensitive localities withheld.`,
                    );
                  }}
                >
                  <Download size={17} /> Export CSV
                </Button>
                <Button
                  secondary
                  disabled={!rows.some((o) => o.provenance.includes("Seeded"))}
                  onClick={() =>
                    download(
                      csvText(
                        rows.filter((o) => o.provenance.includes("Seeded")),
                      ),
                      "example-research-dataset.csv",
                      "text/csv;charset=utf-8",
                    )
                  }
                >
                  <Download size={17} /> Example Dataset
                </Button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "Record",
                        "Species identification",
                        "Observed",
                        "Broad location",
                        "Method / task",
                        "Identification",
                        "Review",
                        "",
                      ].map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, limit).map((o) => (
                      <tr key={o.id}>
                        <td>
                          <code>{o.id.slice(0, 10)}</code>
                          <small>
                            {o.provenance.includes("Seeded")
                              ? "SAMPLE"
                              : "LOCAL DEMO"}
                          </small>
                        </td>
                        <td>
                          <strong>
                            {o.speciesId === null
                              ? "Mystery Discovery"
                              : species[o.speciesId].name}
                          </strong>
                          <small className="latin">
                            {o.speciesId === null
                              ? o.provisional
                              : species[o.speciesId].latin}
                          </small>
                        </td>
                        <td>{dateLabel(o.observedAt)}</td>
                        <td>
                          {o.sensitive ? (
                            <>
                              <Lock size={13} /> Restricted
                            </>
                          ) : (
                            o.location
                          )}
                        </td>
                        <td>
                          {o.method}
                          <small>
                            {state.tasks.find((t) => t.id === o.taskId)
                              ?.title || "Casual observation"}
                          </small>
                          {o.projectId && (
                            <button
                              className="table-project-link"
                              onClick={() => setView("Research Projects")}
                            >
                              {state.projects.find((p) => p.id === o.projectId)
                                ?.title || "Linked project"}{" "}
                              <ArrowUpRight size={11} />
                            </button>
                          )}
                        </td>
                        <td>
                          {o.identification}
                          <small>
                            {o.sensitive
                              ? "Precision restricted"
                              : `± ${o.uncertainty} m location uncertainty`}
                          </small>
                        </td>
                        <td>
                          <Pill>{o.review}</Pill>
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={"Inspect record " + o.id}
                            onClick={() => setSelected(o.id)}
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > limit && (
                  <div className="load-more">
                    <p>
                      Showing {limit} of {rows.length} matching observations.
                      CSV includes the complete filtered dataset.
                    </p>
                    <Button secondary onClick={() => setLimit((n) => n + 50)}>
                      Show 50 More Observations
                    </Button>
                  </div>
                )}
                {!rows.length && (
                  <div className="empty">
                    <FlaskConical />
                    <h3>No observations in this view.</h3>
                    <p>
                      Save a discovery in the app, or load Demo Explorer in
                      Profile after completing consent.
                    </p>
                    <Link to="/" className="text-link">
                      Open explorer app <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </section>
            <p className="footnote">
              Export uses Darwin Core-aligned concepts. Precise coordinates are
              excluded; sensitive localities are withheld. Withdrawn consent
              remains recorded for provenance; production retention requires
              project governance.
            </p>
          </>
        )}
        <footer className="research-footer">
          <Leaf size={16} />
          {config.name} · local research demonstration
          <span>Discover → Record → Review → Understand</span>
        </footer>
      </main>
      {selectedObs && (
        <ObservationDetails
          o={selectedObs}
          research
          onClose={() => setSelected("")}
        />
      )}
      {edit && (
        <Modal title="Edit research task" onClose={() => setEdit(null)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setState((s) => ({
                ...s,
                tasks: s.tasks.map((t) => (t.id === edit.id ? edit : t)),
              }));
              setEdit(null);
              toast(
                "Task updated. Published tasks are visible in the explorer app.",
              );
            }}
          >
            {(
              [
                "title",
                "question",
                "instructions",
                "target",
                "region",
                "requiredFields",
                "safety",
              ] as const
            ).map((key) => (
              <label key={key}>
                {
                  {
                    title: "Task title",
                    question: "Scientific question",
                    instructions: "Observation protocol",
                    target: "Target organism / habitat",
                    region: "Region",
                    requiredFields: "Required fields",
                    safety: "Safety instructions",
                  }[key]
                }
                <textarea
                  required
                  value={edit[key]}
                  onChange={(e) => setEdit({ ...edit, [key]: e.target.value })}
                />
              </label>
            ))}
            <label>
              Duration (minutes)
              <input
                type="number"
                min="1"
                required
                value={edit.duration}
                onChange={(e) =>
                  setEdit({ ...edit, duration: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Availability
              <select
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
              >
                <option>Published</option>
                <option>Draft</option>
                <option>Closed</option>
              </select>
            </label>
            <Button type="submit">
              Save Demo Task <Check size={18} />
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
export function Showcase() {
  const [panel, setPanel] = useState("Overview");
  const { state } = useApp();
  const panels = [
    "Overview",
    "Discovery",
    "Two-sided Card",
    "Research Flow",
    "Monitoring",
    "Gamification",
    "Research Dashboard",
    "Discovery Map",
    "3D Character",
    "Explore Worlds",
    "Community Worlds",
    "Research Projects",
  ];
  const phones = (items: string[][]) => (
    <div className="showcase-phones">
      {items.map(([path, title]) => (
        <div key={path}>
          <div className="phone-frame">
            <iframe
              title={title}
              src={path + (path.includes("?") ? "&" : "?") + "presentation=1"}
            />
          </div>
          <h3>{title}</h3>
        </div>
      ))}
    </div>
  );
  return (
    <main className="showcase">
      <header>
        <Logo />
        <Link className="text-link" to="/home">
          Open prototype <ArrowUpRight size={18} />
        </Link>
      </header>
      <div className="showcase-intro">
        <p className="eyebrow">DISCOVER · COLLECT · CONTRIBUTE</p>
        <h1>
          Curiosity, with a<br />
          <em>greater purpose.</em>
        </h1>
        <p>
          A mobile adventure connecting everyday nature discoveries
          <br />
          with structured biodiversity observations.
        </p>
      </div>
      <div className="showcase-tabs">
        {panels.map((p) => (
          <button
            key={p}
            className={panel === p ? "selected" : ""}
            onClick={() => setPanel(p)}
          >
            {p}
          </button>
        ))}
      </div>
      {panel === "Discovery Map" ? (
        phones([["/map", "Every discovery has a place."]])
      ) : panel === "3D Character" ? (
        phones([["/character/3", "Meet Bumbloom, in three dimensions."]])
      ) : panel === "Explore Worlds" ? (
        phones([["/explore", "A little world, brought to life."]])
      ) : panel === "Community Worlds" ? (
        phones([
          ["/explore?tab=community", "Fictional worlds. Shared inspiration."],
        ])
      ) : panel === "Research Projects" ? (
        <div className="dashboard-frame">
          <iframe
            title="Research project builder showcase"
            src="/researcher-demo?view=projects"
          />
        </div>
      ) : panel === "Overview" ? (
        phones([
          ["/home", "Your everyday adventure"],
          ["/scan", "A closer look at nature"],
          ["/collection", "Discoveries worth collecting"],
        ])
      ) : panel === "Two-sided Card" ? (
        <div className="showcase-cards">
          <SpeciesCard s={species[3]} />
          <div className="showcase-flip">
            <RefreshCw />
            <span>
              One discovery.
              <br />
              Two ways to connect.
            </span>
          </div>
          <SpeciesCard s={species[3]} character />
        </div>
      ) : panel === "Discovery" ? (
        phones([
          ["/scan", "01 · Scan"],
          ["/identify/3", "02 · Identify"],
          ["/record/3", "03 · Record"],
        ])
      ) : panel === "Research Flow" ? (
        <div className="flow-composition">
          <div className="flow-head">
            <Pill>LOCAL PIPELINE DEMONSTRATION</Pill>
            <h2>Every observation has a next chapter.</h2>
          </div>
          <div className="flow-cards">
            <article>
              <Camera size={36} />
              <span>01 / DISCOVER</span>
              <h2>A moment outside.</h2>
              <Photo id={0} />
              <p>
                Photograph an organism. Record time, location precision, method
                and effort.
              </p>
            </article>
            <ArrowRight />
            <article>
              <BookOpen size={36} />
              <span>02 / STRUCTURE</span>
              <h2>A useful record.</h2>
              <div className="code-card">
                occurrenceID
                <br />
                eventDate
                <br />
                scientificName
                <br />
                samplingProtocol
                <br />
                consentRecordId
              </div>
              <p>
                Consent-linked records preserve identification uncertainty and
                provenance.
              </p>
            </article>
            <ArrowRight />
            <article>
              <FlaskConical size={36} />
              <span>03 / RESEARCH</span>
              <h2>A better question.</h2>
              <div className="flow-count">
                <strong>{authorisedObservations(state).length}</strong>submitted
                demo records
              </div>
              <p>
                Inspect, filter, review and export in the demonstration research
                workspace.
              </p>
              <Link to="/researcher-demo" className="text-link">
                Open workspace <ArrowUpRight size={17} />
              </Link>
            </article>
          </div>
        </div>
      ) : panel === "Monitoring" ? (
        phones([
          ["/tasks", "A defined protocol"],
          ["/record/5", "A structured record"],
          ["/sites", "A longer story"],
        ])
      ) : panel === "Gamification" ? (
        <div className="gamification-showcase">
          <div className="evolution-showcase">
            <p className="eyebrow">GROW THROUGH CURIOSITY</p>
            <h2>A companion for every chapter.</h2>
            <div>
              {[1, 2, 3].map((stage) => (
                <div className={"evolution-stage stage-" + stage} key={stage}>
                  <Creature kind={0} stage={stage} />
                  <Pill lavender>STAGE {stage}</Pill>
                </div>
              ))}
            </div>
            <p>
              Illustrative evolution · rewards recognise participation, not
              scientific accuracy.
            </p>
          </div>
          <div className="showcase-world">
            <World large />
            <h2>A little world shaped by your discoveries.</h2>
          </div>
        </div>
      ) : (
        <div className="dashboard-frame">
          <iframe
            title="Researcher dashboard showcase"
            src="/researcher-demo"
          />
        </div>
      )}
      <footer>
        <span>{config.name} · nature discovery prototype</span>
        <span>
          Concept prototype · local simulation · no verified conservation
          outcomes
        </span>
      </footer>
    </main>
  );
}
