import { species } from "./data";
import { config } from "./config";
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  "demo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
export type Consent = {
  id: string;
  participantId: string;
  version: string;
  timestamp: string;
  accepted: boolean;
  scope: string;
  withdrawnAt?: string;
};
export type Observation = {
  id: string;
  contributor: string;
  speciesId: number | null;
  provisional: string;
  observedAt: string;
  createdAt: string;
  location: string;
  uncertainty: number;
  coordinates?: { lat: number; lon: number };
  photo?: string;
  identification: string;
  review: string;
  reviewNotes: string;
  method: string;
  notes: string;
  taskId: string;
  siteId: string;
  consentId: string;
  sensitive: boolean;
  provenance: string;
  recordType: "HumanObservation";
  individuals: number;
  duration: number;
  habitat: string;
  activity: string;
  weather: string;
  projectId?: string;
};
export type Task = {
  id: string;
  title: string;
  question: string;
  instructions: string;
  target: string;
  region: string;
  duration: number;
  status: string;
  reward: number;
  type: "Research" | "Exploration";
  requiredFields: string;
  safety: string;
  projectId?: string;
  requiredCategory?: string;
  requiresNotes?: boolean;
  requiresSite?: boolean;
  repeatVisits?: number;
};
export type ResearchProject = {
  id: string;
  title: string;
  description: string;
  question: string;
  status: string;
};
export type BiomeId = "meadow" | "woodland" | "wetland";
export type GameProgress = {
  availableGrowthXP: number;
  characterGrowth: Record<string, number>;
  activeCompanionId: number | null;
  selectedBiome: BiomeId;
  appreciations: string[];
};
export const initialProjects: ResearchProject[] = [
  {
    id: "urban-habitats",
    title: "Urban Habitat Notes",
    description:
      "A demonstration of repeated community observations in public green spaces.",
    question:
      "What can consistent visits document about visible vegetation conditions?",
    status: "Active",
  },
  {
    id: "seasonal-life",
    title: "Seasonal Encounters",
    description:
      "A fictional research programme exploring structured bird and flower-visitor records.",
    question: "How do observations vary with time, habitat and survey effort?",
    status: "Active",
  },
];
const newGame = (): GameProgress => ({
  availableGrowthXP: 0,
  characterGrowth: {},
  activeCompanionId: null,
  selectedBiome: "meadow",
  appreciations: [],
});
export type Site = {
  id: string;
  name: string;
  location: string;
  uncertainty: number;
  habitat: string;
  coordinates?: { lat: number; lon: number };
};
export type State = {
  consents: Consent[];
  observations: Observation[];
  xp: number;
  claimed: string[];
  ecosystem: number[];
  tasks: Task[];
  sites: Site[];
  mode: string;
  projects: ResearchProject[];
  game: GameProgress;
};
export const initialTasks: Task[] = [
  {
    id: "tree",
    title: "Urban Tree Watch",
    question:
      "How do repeated observations document visible changes in urban tree conditions?",
    instructions:
      "Revisit the same tree. Photograph from a similar position. Record visible foliage and flowering, the date and observation effort.",
    target: "Trees",
    region: "Australian urban green spaces",
    duration: 5,
    status: "Published",
    reward: 40,
    type: "Research",
    requiredFields: "Date, site, duration, foliage notes",
    safety:
      "Observe from a safe public path. Do not enter private land or damage vegetation.",
  },
  {
    id: "birds",
    title: "Seasonal Bird Survey",
    question: "Which birds are observed during a consistent five-minute watch?",
    instructions:
      "Stay in one safe location for five minutes. Record an identified bird, number seen, habitat and effort. This prototype records positive sightings only.",
    target: "Birds",
    region: "Australia",
    duration: 5,
    status: "Published",
    reward: 30,
    type: "Research",
    requiredFields: "Date, site, duration, number observed",
    safety: "Keep your distance. Avoid nests and do not feed birds.",
  },
  {
    id: "spotter",
    title: "Bird Spotter",
    question: "Discover two different common birds.",
    instructions:
      "Save observations of two different bird species. Use the demo samples for the presentation.",
    target: "Birds",
    region: "Australia",
    duration: 0,
    status: "Published",
    reward: 30,
    type: "Exploration",
    requiredFields: "Two bird species",
    safety: "Keep a respectful distance from wildlife.",
  },
  {
    id: "leaf",
    title: "Leaf Explorer",
    question: "Discover two different plants.",
    instructions: "Observe plants without picking leaves or flowers.",
    target: "Plants",
    region: "Australia",
    duration: 0,
    status: "Published",
    reward: 30,
    type: "Exploration",
    requiredFields: "Two plant species",
    safety: "Stay on public paths.",
  },
];
export const emptyState = (): State => ({
  consents: [],
  observations: [],
  xp: 0,
  claimed: [],
  ecosystem: [],
  tasks: initialTasks.map(enrichTask),
  sites: [],
  mode: "Fresh Explorer",
  projects: initialProjects.map((p) => ({ ...p })),
  game: newGame(),
});
export const activeConsent = (s: State) => {
  const c = s.consents.at(-1);
  return c?.accepted && !c.withdrawnAt && c.version === config.consentVersion
    ? c
    : undefined;
};
export const makeConsent = (accepted: boolean): Consent => ({
  id: uid(),
  participantId: config.participantId,
  version: config.consentVersion,
  timestamp: new Date().toISOString(),
  accepted,
  scope:
    "Biodiversity photographs, identifications, dates, locations, and survey metadata for authorised biodiversity research; local prototype only.",
});
export function enrichTask(t: Task): Task {
  return {
    ...(t.id === "tree"
      ? {
          projectId: "urban-habitats",
          requiredCategory: "Plants",
          requiresNotes: true,
        }
      : t.id === "birds"
        ? { projectId: "seasonal-life", requiredCategory: "Birds" }
        : {}),
    ...t,
  };
}
export const exampleSites: Site[] = [
  {
    id: "site-a",
    name: "Centennial Park · tree",
    location: "Centennial Parklands, Sydney",
    coordinates: { lat: -33.898, lon: 151.234 },
    uncertainty: 100,
    habitat: "Urban green space",
  },
  {
    id: "site-b",
    name: "Botanic Garden · flowering edge",
    location: "Royal Botanic Garden Sydney",
    coordinates: { lat: -33.865, lon: 151.216 },
    uncertainty: 50,
    habitat: "Garden",
  },
  {
    id: "site-c",
    name: "Sydney Park · woodland path",
    location: "Sydney Park, St Peters",
    coordinates: { lat: -33.908, lon: 151.182 },
    uncertainty: 100,
    habitat: "Woodland",
  },
  {
    id: "site-d",
    name: "Campus · tree walk",
    location: "UNSW Kensington campus",
    coordinates: { lat: -33.917, lon: 151.232 },
    uncertainty: 150,
    habitat: "Urban green space",
  },
  {
    id: "site-e",
    name: "Bicentennial Park · reed edge",
    location: "Bicentennial Park, Sydney Olympic Park",
    coordinates: { lat: -33.854, lon: 151.08 },
    uncertainty: 250,
    habitat: "Wetland",
  },
  {
    id: "site-f",
    name: "Hyde Park · garden edge",
    location: "Hyde Park, Sydney",
    coordinates: { lat: -33.874, lon: 151.211 },
    uncertainty: 75,
    habitat: "Garden",
  },
];
export function seedState(s: State): State {
  const consent = activeConsent(s);
  if (!consent) return s;
  const ids = [3, 2, 0, 5, 1, 4, 3, 0, 5, 2, 1, 3, 0, 2, 4, 5, 3, null];
  return {
    ...s,
    mode: "Demo Explorer",
    xp: 640,
    claimed: ["tree", "spotter"],
    ecosystem: [0, 1, 2, 3, 4, 5],
    projects: s.projects?.length ? s.projects : initialProjects,
    tasks: s.tasks.map(enrichTask),
    sites: exampleSites.map((x) => ({ ...x })),
    game: {
      ...newGame(),
      availableGrowthXP: 180,
      characterGrowth: { 0: 145, 1: 35, 2: 210, 3: 85, 4: 50, 5: 130 },
      activeCompanionId: 3,
    },
    observations: ids.map((id, i) => {
      const site = exampleSites[i % 6];
      const taskId =
        id === 2 || id === 5 ? "tree" : id === 0 || id === 1 ? "birds" : "";
      return {
        id: "sample-" + (i + 1),
        contributor: config.participantId,
        speciesId: id,
        provisional: id === null ? "Insects" : "",
        observedAt: `2026-${i < 6 ? "09" : "10"}-${String(4 + i).padStart(2, "0")}T${i % 2 ? "15" : "09"}:30`,
        createdAt: "2026-10-22T09:00:00+11:00",
        location: site.location,
        coordinates: site.coordinates,
        uncertainty: site.uncertainty,
        identification:
          id === null
            ? "Identification unconfirmed"
            : "User-confirmed demo identification",
        review:
          i % 7 === 0
            ? "Needs clarification"
            : i % 4 === 0
              ? "Demo reviewed"
              : "Awaiting review",
        reviewNotes: "",
        method: i % 3 ? "Visual observation" : "Timed stationary survey",
        notes:
          "Fictional demonstration visit. " +
          (taskId === "tree"
            ? "Foliage and flowering appearance recorded as example context."
            : "No real field event or verified species occurrence is asserted."),
        taskId,
        projectId:
          taskId === "tree" ? "urban-habitats" : taskId ? "seasonal-life" : "",
        siteId: site.id,
        consentId: consent.id,
        sensitive: i === 17,
        provenance: "Seeded demonstration · fictional observation",
        recordType: "HumanObservation" as const,
        individuals: 1 + (i % 3),
        duration: 5,
        habitat: site.habitat,
        activity: id === 2 || id === 5 ? "Foliage noted" : "Observed",
        weather: "Example: clear",
      };
    }),
  };
}
export function migrateState(input: Partial<State>): State {
  const base = { ...emptyState(), ...input };
  const characterGrowth: Record<string, number> = {};
  for (const id of speciesIds(base))
    characterGrowth[id] = Math.min(
      300,
      (base.observations.filter((o) => o.speciesId === id).length * 20 +
        base.claimed.length * 15) *
        3,
    );
  return {
    ...base,
    tasks: (base.tasks || initialTasks).map(enrichTask),
    projects: base.projects || initialProjects,
    game: {
      ...newGame(),
      availableGrowthXP: Math.min(200, base.xp),
      characterGrowth,
      ...input.game,
    },
  };
}
export function characterProgress(s: State, id: number) {
  const growth = Math.max(0, Math.min(300, s.game.characterGrowth[id] || 0));
  return {
    growth,
    stage: growth < 100 ? 1 : growth < 200 ? 2 : 3,
    level: 1 + Math.floor(growth / 25),
    percent: growth === 300 ? 100 : growth % 100,
  };
}
export function feedCharacter(s: State, id: number): State {
  if (
    !speciesIds(s).includes(id) ||
    s.game.availableGrowthXP < 10 ||
    characterProgress(s, id).growth >= 300
  )
    return s;
  return {
    ...s,
    game: {
      ...s.game,
      availableGrowthXP: s.game.availableGrowthXP - 10,
      characterGrowth: {
        ...s.game.characterGrowth,
        [id]: Math.min(300, characterProgress(s, id).growth + 10),
      },
    },
  };
}
export const repository = {
  load(): State {
    try {
      const s = JSON.parse(localStorage.getItem(config.storageKey) || "null");
      return s && Array.isArray(s.consents) && Array.isArray(s.observations)
        ? migrateState(s)
        : emptyState();
    } catch {
      return emptyState();
    }
  },
  save(s: State) {
    localStorage.setItem(config.storageKey, JSON.stringify(s));
  },
};
export function speciesIds(s: State) {
  return [
    ...new Set(
      s.observations.flatMap((o) =>
        o.speciesId === null ? [] : [o.speciesId],
      ),
    ),
  ];
}
export function taskProgress(t: Task, s: State) {
  if (t.id === "spotter")
    return (
      Math.min(
        2,
        speciesIds(s).filter((id) => species[id].category === "Birds").length,
      ) / 2
    );
  if (t.id === "leaf")
    return (
      Math.min(
        2,
        speciesIds(s).filter((id) => species[id].category === "Plants").length,
      ) / 2
    );
  const visits = s.observations.filter((o) => o.taskId === t.id);
  const required = t.repeatVisits || 1;
  return Math.min(
    1,
    required > 1
      ? Math.max(
          0,
          ...[...new Set(visits.map((o) => o.siteId).filter(Boolean))].map(
            (id) =>
              new Set(
                visits.filter((o) => o.siteId === id).map((o) => o.observedAt),
              ).size,
          ),
        ) / required
      : visits.length / required,
  );
}
export function exportRows(rows: Observation[]) {
  return rows.map((o) => ({
    occurrenceID: o.id,
    eventDate: o.observedAt,
    scientificName: o.speciesId === null ? "" : species[o.speciesId].latin,
    vernacularName:
      o.speciesId === null ? o.provisional : species[o.speciesId].name,
    locality: o.sensitive ? "Restricted" : o.location,
    coordinateUncertaintyInMeters: o.sensitive ? "" : o.uncertainty,
    samplingProtocol: o.method,
    basisOfRecord: o.recordType,
    individualCount: o.individuals,
    samplingEffort: o.duration,
    identificationVerificationStatus: o.identification,
    reviewStatus: o.review,
    taskId: o.taskId,
    projectId: o.projectId || "",
    observationSiteID: o.sensitive ? "Restricted" : o.siteId,
    consentRecordId: o.consentId,
    provenance: o.provenance,
  }));
}
export function csvText(rows: Observation[]) {
  const records = exportRows(rows);
  if (!records.length) return "";
  const keys = Object.keys(records[0]);
  const esc = (v: unknown) => {
    const text = String(v ?? "");
    const prefix = /^[=+\-@\t\r]/.test(text) ? "'" : "";
    return '"' + prefix + text.replace(/"/g, '""') + '"';
  };
  return [
    keys.map(esc).join(","),
    ...records.map((r) =>
      keys.map((k) => esc(r[k as keyof typeof r])).join(","),
    ),
  ].join("\r\n");
}
