import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  FlaskConical,
  MapPin,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useApp } from "./context";
import {
  Observation,
  ResearchProject,
  Task,
  uid,
  exampleSites,
  authorisedObservations,
} from "./store";
import { species } from "./data";
import { Button, Modal, Pill, dateLabel } from "./ui";
export function ResearchProjects({
  onRecords,
}: {
  onRecords: (taskId: string) => void;
}) {
  const { state, setState, toast } = useApp();
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const template = (projectId: string): Task => ({
    id: uid(),
    projectId,
    title: "",
    question: "",
    instructions: "",
    target: "Plants",
    requiredCategory: "Plants",
    region: "Sydney public green spaces",
    duration: 5,
    status: "Published",
    reward: 40,
    type: "Research",
    requiredFields: "Date, time, location and uncertainty, observation effort",
    safety:
      "Use a safe public path. Keep your distance from wildlife. Do not handle organisms or disturb nests.",
    requiresNotes: true,
    requiresSite: false,
    repeatVisits: 1,
  });
  return (
    <>
      <div className="project-toolbar">
        <div>
          <h2>Research Projects & Task Builder</h2>
          <p>Turn a research question into a clear field protocol.</p>
        </div>
        <Button
          secondary
          onClick={() =>
            setProject({
              id: uid(),
              title: "",
              description: "",
              question: "",
              status: "Active",
            })
          }
        >
          <Plus size={17} /> New Research Project
        </Button>
      </div>
      <div className="research-project-grid">
        {state.projects.map((p) => {
          const tasks = state.tasks.filter((t) => t.projectId === p.id);
          const records = authorisedObservations(state).filter(
            (o) => o.projectId === p.id || tasks.some((t) => t.id === o.taskId),
          );
          return (
            <article className="project-card" key={p.id}>
              <div className="task-card-head">
                <FlaskConical />
                <Pill>{p.status} · DEMO PROJECT</Pill>
              </div>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="project-question">
                <span className="eyebrow">RESEARCH QUESTION</span>
                <h3>{p.question}</h3>
              </div>
              <div className="project-counts">
                <span>
                  {tasks.filter((t) => t.status === "Published").length}{" "}
                  published tasks
                </span>
                <span>{records.length} linked observations</span>
              </div>
              <div className="project-task-list">
                {tasks.map((t) => (
                  <div key={t.id}>
                    <div>
                      <strong>{t.title}</strong>
                      <small>
                        {t.status} · {t.duration} min · {t.repeatVisits || 1}{" "}
                        visit{(t.repeatVisits || 1) > 1 ? "s" : ""}
                      </small>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => onRecords(t.id)}
                      aria-label={
                        "View linked records for " +
                        t.title +
                        ": " +
                        records.filter((o) => o.taskId === t.id).length +
                        " observations"
                      }
                    >
                      <BookOpen size={16} />{" "}
                      {records.filter((o) => o.taskId === t.id).length}
                    </button>
                    <button
                      className="text-link"
                      onClick={() => setTask({ ...t })}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              <Button onClick={() => setTask(template(p.id))}>
                <Plus size={18} /> Create Research Task
              </Button>
              <button
                className="text-link"
                onClick={() => setProject({ ...p })}
              >
                Edit Project <ArrowRight size={15} />
              </button>
            </article>
          );
        })}
      </div>
      <div className="notice">
        <FlaskConical size={18} />
        <p>
          Published tasks are available in the explorer app. Submitted
          observations retain their project and task links. All research
          projects, access and reviews are local demonstrations.
        </p>
      </div>
      {project && (
        <Modal
          title={
            state.projects.some((p) => p.id === project.id)
              ? "Edit research project"
              : "New research project"
          }
          onClose={() => setProject(null)}
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setState((s) => ({
                ...s,
                projects: s.projects.some((p) => p.id === project.id)
                  ? s.projects.map((p) => (p.id === project.id ? project : p))
                  : [...s.projects, project],
              }));
              setProject(null);
              toast("Research project saved locally.");
            }}
          >
            <label>
              Project title
              <input
                required
                value={project.title}
                onChange={(e) =>
                  setProject({ ...project, title: e.target.value })
                }
              />
            </label>
            <label>
              Project description
              <textarea
                required
                value={project.description}
                onChange={(e) =>
                  setProject({ ...project, description: e.target.value })
                }
              />
            </label>
            <label>
              Scientific question
              <textarea
                required
                value={project.question}
                onChange={(e) =>
                  setProject({ ...project, question: e.target.value })
                }
              />
            </label>
            <label>
              Project status
              <select
                value={project.status}
                onChange={(e) =>
                  setProject({ ...project, status: e.target.value })
                }
              >
                <option>Active</option>
                <option>Planning</option>
                <option>Closed</option>
              </select>
            </label>
            <Button type="submit">
              Save Research Project <Check size={17} />
            </Button>
          </form>
        </Modal>
      )}
      {task && (
        <Modal
          title={
            state.tasks.some((t) => t.id === task.id)
              ? "Edit task protocol"
              : "Create Research Task"
          }
          onClose={() => setTask(null)}
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              setState((s) => ({
                ...s,
                tasks: s.tasks.some((t) => t.id === task.id)
                  ? s.tasks.map((t) => (t.id === task.id ? task : t))
                  : [...s.tasks, task],
              }));
              setTask(null);
              toast(
                task.status === "Published"
                  ? "Task published locally. Open Tasks in the explorer app."
                  : "Task saved as a local draft.",
              );
            }}
          >
            <label>
              Project
              <select
                required
                value={task.projectId}
                onChange={(e) =>
                  setTask({ ...task, projectId: e.target.value })
                }
              >
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Task title
              <input
                required
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
              />
            </label>
            <label>
              Scientific question
              <textarea
                required
                value={task.question}
                onChange={(e) => setTask({ ...task, question: e.target.value })}
              />
            </label>
            <label>
              Observation protocol
              <textarea
                required
                value={task.instructions}
                onChange={(e) =>
                  setTask({ ...task, instructions: e.target.value })
                }
              />
            </label>
            <div className="form-two">
              <label>
                Target category
                <select
                  value={task.requiredCategory || "All"}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      requiredCategory: e.target.value,
                      target: e.target.value,
                    })
                  }
                >
                  {[
                    "All",
                    "Birds",
                    "Plants",
                    "Insects",
                    "Mammals",
                    "Fungi",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={task.duration}
                  onChange={(e) =>
                    setTask({ ...task, duration: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label>
              Region
              <input
                required
                value={task.region}
                onChange={(e) => setTask({ ...task, region: e.target.value })}
              />
            </label>
            <label>
              Required metadata
              <textarea
                required
                value={task.requiredFields}
                onChange={(e) =>
                  setTask({ ...task, requiredFields: e.target.value })
                }
              />
            </label>
            <label>
              Recommended public survey area
              <select
                value={task.recommendedSiteId || ""}
                onChange={(e) =>
                  setTask({ ...task, recommendedSiteId: e.target.value })
                }
              >
                <option value="">No recommended area</option>
                {exampleSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <small>
                Opens a highlighted area in Map via Take Me There. No live
                navigation.
              </small>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={!!task.requiresNotes}
                onChange={(e) =>
                  setTask({ ...task, requiresNotes: e.target.checked })
                }
              />
              Require field notes
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={!!task.requiresSite}
                onChange={(e) =>
                  setTask({ ...task, requiresSite: e.target.checked })
                }
              />
              Require a named observation site
            </label>
            <div className="form-two">
              <label>
                Visits to same site
                <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  value={task.repeatVisits || 1}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      repeatVisits: Number(e.target.value),
                      requiresSite:
                        Number(e.target.value) > 1 || task.requiresSite,
                    })
                  }
                />
              </label>
              <label>
                XP reward
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={task.reward}
                  onChange={(e) =>
                    setTask({ ...task, reward: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label>
              Safety instructions
              <textarea
                required
                value={task.safety}
                onChange={(e) => setTask({ ...task, safety: e.target.value })}
              />
            </label>
            <label>
              Availability
              <select
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value })}
              >
                <option>Published</option>
                <option>Draft</option>
                <option>Closed</option>
              </select>
            </label>
            <div className="notice">
              A published protocol becomes visible in Tasks. Required category,
              effort, notes, site and repeat-visit rules apply to observation
              recording. XP is not scientific verification.
            </div>
            <Button type="submit">
              {task.status === "Published"
                ? "Publish Demo Task"
                : "Save Task Draft"}{" "}
              <Check size={17} />
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function ResearchMonitoring({
  rows,
  onInspect,
}: {
  rows: Observation[];
  onInspect: (id: string) => void;
}) {
  const { state } = useApp();
  const [selected, setSelected] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [taxon, setTaxon] = useState("All");
  const visible = rows.filter(
    (o) =>
      (taxon === "All" || String(o.speciesId) === taxon) &&
      (!from || o.observedAt.slice(0, 10) >= from) &&
      (!to || o.observedAt.slice(0, 10) <= to),
  );
  return (
    <>
      <div className="section-title">
        <h2>Repeat-site monitoring</h2>
        <Pill>CONSISTENT METHODS MATTER</Pill>
      </div>
      <p className="muted">
        Inspect repeated visits, effort, identification uncertainty and review
        states. A change in recorded counts is not evidence of population
        change.
      </p>
      <div className="monitor-filters">
        <label>
          Species
          <select value={taxon} onChange={(e) => setTaxon(e.target.value)}>
            <option value="All">All species</option>
            {species.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          From date
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To date
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <div className="research-project-grid">
        {state.sites.map((site) => {
          const visits = visible
            .filter((o) => o.siteId === site.id)
            .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
          if (!visits.length) return null;
          const restricted = state.observations.some(
            (o) => o.siteId === site.id && o.sensitive,
          );
          return (
            <article className="project-card monitoring-card" key={site.id}>
              <div className="task-card-head">
                <MapPin />
                <Pill>{visits.length} VISITS</Pill>
              </div>
              <h2>{restricted ? "Restricted monitoring site" : site.name}</h2>
              <p>
                {restricted
                  ? "Location and site identifiers withheld."
                  : site.location}
              </p>
              <dl className="metadata">
                <dt>First / latest</dt>
                <dd>
                  {dateLabel(visits[0].observedAt)} /{" "}
                  {dateLabel(visits.at(-1)!.observedAt)}
                </dd>
                <dt>Location uncertainty</dt>
                <dd>
                  {Math.min(...visits.map((o) => o.uncertainty))}–
                  {Math.max(...visits.map((o) => o.uncertainty))} m
                </dd>
                <dt>Survey effort</dt>
                <dd>
                  {visits.reduce((a, o) => a + o.duration, 0)} recorded minutes
                </dd>
                <dt>Awaiting review</dt>
                <dd>
                  {visits.filter((o) => o.review === "Awaiting review").length}
                </dd>
              </dl>
              <Button secondary onClick={() => setSelected(site.id)}>
                <RefreshCw size={17} /> Inspect Visit Timeline
              </Button>
            </article>
          );
        })}
      </div>
      {!visible.some((o) => o.siteId) && (
        <div className="empty">
          <MapPin />
          <h3>No documented sites in this view.</h3>
          <p>
            Save a named site with an observation to begin repeat monitoring.
          </p>
        </div>
      )}
      {selected && (
        <Modal
          title={
            rows.some((o) => o.siteId === selected && o.sensitive)
              ? "Restricted site timeline"
              : state.sites.find((s) => s.id === selected)?.name ||
                "Visit timeline"
          }
          onClose={() => setSelected("")}
        >
          <div className="timeline">
            {visible
              .filter((o) => o.siteId === selected)
              .sort((a, b) => a.observedAt.localeCompare(b.observedAt))
              .map((o) => (
                <div key={o.id}>
                  <span className="timeline-dot" />
                  <strong>{dateLabel(o.observedAt)}</strong>
                  <p>
                    {o.speciesId === null
                      ? "Unidentified"
                      : species[o.speciesId].name}{" "}
                    · {o.duration} min · ± {o.uncertainty} m
                  </p>
                  <p>
                    {o.identification} · {o.review}
                  </p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setSelected("");
                      onInspect(o.id);
                    }}
                  >
                    Inspect Observation <ArrowRight size={15} />
                  </button>
                </div>
              ))}
          </div>
          <p className="footnote">
            Timelines document records and effort. Expert interpretation is
            required before drawing ecological conclusions.
          </p>
        </Modal>
      )}
    </>
  );
}
