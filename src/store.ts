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
  recommendedSiteId?: string;
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
  startMode: "demo" | "fresh";
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
  {
    id: "pollinator",
    title: "Pollinator Watch",
    question: "Which flower visitors are recorded across five visits to the same garden edge?",
    instructions: "Return to the same named site on five different visits. Watch for five minutes, record a flower visitor and describe its activity without touching it. Positive sightings only; these do not measure pollinator abundance.",
    target: "Flower-visiting insects",
    region: "Sydney public gardens",
    duration: 5,
    status: "Published",
    reward: 50,
    type: "Research",
    requiredFields: "Date, named site, five minutes effort, visitor activity notes",
    safety: "Stay on public paths. Do not handle bees, approach nests or pick flowers.",
    projectId: "seasonal-life",
    requiredCategory: "Insects",
    requiresNotes: true,
    requiresSite: true,
    repeatVisits: 5,
    recommendedSiteId: "site-b",
  },
];
export const emptyState = (startMode: "demo" | "fresh" = "demo"): State => ({
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
  startMode,
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
    recommendedSiteId: ({ tree: "site-a", birds: "site-c", spotter: "site-c", leaf: "site-d", pollinator: "site-b" } as Record<string, string>)[t.id],
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
  {
    id: "site-g",
    name: "Coogee · community garden",
    location: "Coogee public garden area",
    coordinates: { lat: -33.922, lon: 151.254 },
    uncertainty: 200,
    habitat: "Garden",
  },
  {
    id: "site-h",
    name: "Campus · flowering courtyard",
    location: "UNSW Kensington public courtyard",
    coordinates: { lat: -33.919, lon: 151.226 },
    uncertainty: 100,
    habitat: "Urban green space",
  },
];
// Explicit, shared field stories. Dates are fixed for a repeatable presentation;
// none of these entries asserts a real occurrence at the example public areas.
const demoVisits: [number | null, number, string, string, string][] = [
  [5, 0, "09-09T09:10", "tree", "Same path-side tree; juvenile foliage visible in the example photo."],
  [3, 1, "09-12T10:20", "pollinator", "A flower visitor paused at the purple flower bed during the timed watch."],
  [1, 2, "09-15T08:15", "birds", "Two small birds moved through low shrubs; watched from the path."],
  [2, 3, "09-18T11:05", "tree", "Yellow flower heads noted on a planted wattle beside the campus walk."],
  [1, 4, "09-20T08:40", "birds", "A bird stayed in dense planting near the reed-edge path."],
  [2, 5, "09-23T14:25", "tree", "Flowering branch photographed from the garden path; no plant material collected."],
  [3, 1, "09-25T10:20", "pollinator", "Returned to the same flower bed; visitor activity noted during five minutes."],
  [4, 2, "10-04T07:55", "birds", "One bird perched above the woodland path; no playback or feeding."],
  [5, 3, "10-06T11:05", "tree", "Repeat tree visit from the same side; leaves and visible canopy noted."],
  [3, 1, "10-08T10:20", "pollinator", "Blue-banded visitor briefly hovered between flowers; identification needs checking."],
  [5, 4, "10-10T09:30", "tree", "Planted eucalypt foliage recorded beside the wetland approach, away from the water."],
  [5, 0, "10-11T09:10", "tree", "Same tree and photo direction as September; visible foliage documented again."],
  [3, 5, "10-12T14:25", "", "Single flower visitor seen on a small flowering border during a casual walk."],
  [5, 0, "10-13T09:10", "tree", "Third monitoring visit; notes describe visible leaves without inferring tree health."],
  [3, 6, "10-15T10:35", "", "Flower visitor photographed from the public garden entrance; no nest approached."],
  [0, 2, "10-17T08:15", "birds", "Three lorikeets visited a flowering tree during a stationary watch."],
  [0, 0, "10-18T09:10", "birds", "Lorikeets called from the canopy above the established monitoring path."],
  [2, 3, "10-19T11:05", "tree", "Revisited the same wattle; flower heads and survey effort recorded."],
  [4, 4, "10-20T08:40", "birds", "A perched kookaburra observed from a designated path; distance maintained."],
  [3, 1, "10-21T10:20", "pollinator", "Fourth visit to the flowering edge. One more visit completes this demo protocol."],
  [3, 7, "10-21T13:45", "", "Flower visitor passed through the courtyard planting during a short photo stop."],
  [0, 5, "10-22T08:30", "birds", "Two lorikeets moved between garden trees during five minutes of observation."],
  [2, 7, "10-22T11:15", "tree", "Wattle leaves and remaining flower heads documented beside the courtyard."],
  [null, 6, "10-22T12:05", "", "Unidentified insect; sensitive-location example requiring additional review."],
];
export function seedState(s: State): State {
  const consent = activeConsent(s);
  if (!consent) return s;
  return {
    ...s,
    mode: "Demo Explorer",
    startMode: "demo",
    xp: 640,
    claimed: ["tree", "spotter"],
    ecosystem: [0, 1, 2, 3, 4, 5],
    projects: s.projects?.length ? s.projects : initialProjects,
    tasks: [...s.tasks, ...initialTasks.filter((t) => !s.tasks.some((old) => old.id === t.id))].map(enrichTask),
    sites: exampleSites.map((x) => ({ ...x })),
    game: {
      ...newGame(),
      availableGrowthXP: 180,
      characterGrowth: { 0: 145, 1: 35, 2: 210, 3: 85, 4: 50, 5: 130 },
      activeCompanionId: 3,
    },
    observations: demoVisits.map(([id, siteIndex, date, taskId, note], i) => {
      const site = exampleSites[siteIndex];
      const observedAt = `2026-${date}:00+${date.startsWith("09") ? "10" : "11"}:00`;
      return {
        id: "sample-" + (i + 1),
        contributor: config.participantId,
        speciesId: id,
        provisional: id === null ? "Insects" : "",
        observedAt,
        createdAt: new Date(new Date(observedAt).getTime() + 5 * 60000).toISOString(),
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
        reviewNotes: i % 7 === 0 ? "Demo review: revisit the identification details and survey notes. No expert verification performed." : i % 4 === 0 ? "Demo completeness check only; not a verified occurrence." : "",
        method: taskId === "pollinator" || taskId === "birds" ? "Timed stationary survey" : i % 2 ? "Photo observation" : "Visual observation",
        notes: "Fictional demonstration visit. " + note,
        taskId,
        projectId:
          taskId === "tree" ? "urban-habitats" : taskId ? "seasonal-life" : "",
        siteId: site.id,
        consentId: consent.id,
        sensitive: id === null,
        provenance: "Seeded demonstration · fictional observation",
        recordType: "HumanObservation" as const,
        individuals: 1 + (i % 3),
        duration: taskId ? 5 : 2 + (i % 4),
        habitat: site.habitat,
        activity: id === 2 || id === 5 ? "Foliage and flowering noted" : id === 3 ? "Visiting flowers" : "Observed from path",
        weather: ["Example: clear", "Example: light cloud", "Example: light breeze"][i % 3],
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
  const migrated: State = {
    ...base,
    startMode: input.startMode || "demo",
    tasks: (base.tasks || initialTasks).map(enrichTask),
    projects: base.projects || initialProjects,
    game: {
      ...newGame(),
      availableGrowthXP: Math.min(200, base.xp),
      characterGrowth,
      ...input.game,
    },
  };
  // Older empty profiles never recorded a Fresh/Demo choice. The presentation
  // default can fill those safely, but never replace existing records/progress.
  return !input.startMode && !base.observations.length && !base.xp && !base.claimed.length && !base.ecosystem.length && activeConsent(base)
    ? seedState(migrated)
    : migrated;
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
export const biomeFor = (id: number): BiomeId =>
  id === 5 ? "wetland" : id === 2 || id === 3 ? "meadow" : "woodland";
export const biomeLabel = (id: number) =>
  ({ meadow: "Meadow", woodland: "Woodland", wetland: "Misty Grove" })[biomeFor(id)];
export function taskDestination(t: Task, s: State): Site | undefined {
  if (t.recommendedSiteId)
    return s.sites.find((site) => site.id === t.recommendedSiteId) || exampleSites.find((site) => site.id === t.recommendedSiteId);
  const previous = s.observations.find((o) => o.taskId === t.id && o.siteId && !o.sensitive);
  return previous ? s.sites.find((site) => site.id === previous.siteId) : undefined;
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
