import { species } from "./data";
import { config } from "./config";
import { activeConsent, speciesIds, researchScope } from "./domain";
export * from "./domain";
export type ResearchPermission = {
  status: "private" | "submitted" | "withdrawn" | "illustrative";
  receiptId?: string;
  submittedAt?: string;
  withdrawnAt?: string;
  agreementVersion?: string;
  agreementConsentId?: string;
  scope?: string;
  events?: { action: "submitted" | "withdrawn"; timestamp: string }[];
};
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
  synthetic?: boolean;
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
  research?: ResearchPermission;
  missingFields?: string[];
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
  recoveryRequired?: boolean;
  showcaseVersion?: number;
  storageUnavailable?: boolean;
  visualSettings?: {
    quality: "balanced" | "low" | "illustrated";
    paused: boolean;
  };
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
    question:
      "Which flower visitors are recorded across five visits to the same garden edge?",
    instructions:
      "Return to the same named site on five different visits. Watch for five minutes, record a flower visitor and describe its activity without touching it. Positive sightings only; these do not measure pollinator abundance.",
    target: "Flower-visiting insects",
    region: "Sydney public gardens",
    duration: 5,
    status: "Published",
    reward: 50,
    type: "Research",
    requiredFields:
      "Date, named site, five minutes effort, visitor activity notes",
    safety:
      "Stay on public paths. Do not handle bees, approach nests or pick flowers.",
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
export const makeConsent = (accepted: boolean): Consent => ({
  id: uid(),
  participantId: config.participantId,
  version: config.consentVersion,
  timestamp: new Date().toISOString(),
  accepted,
  scope:
    "Local biodiversity participation agreement. Only observations explicitly submitted with a research permission receipt are available in the research demonstration; private collection and game data are excluded.",
});
export function enrichTask(t: Task): Task {
  return {
    recommendedSiteId: (
      {
        tree: "site-a",
        birds: "site-c",
        spotter: "site-c",
        leaf: "site-d",
        pollinator: "site-b",
      } as Record<string, string>
    )[t.id],
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
  [
    5,
    0,
    "09-09T09:10",
    "tree",
    "Same path-side tree; juvenile foliage visible in the example photo.",
  ],
  [
    3,
    1,
    "09-12T10:20",
    "pollinator",
    "A flower visitor paused at the purple flower bed during the timed watch.",
  ],
  [
    1,
    2,
    "09-15T08:15",
    "birds",
    "Two small birds moved through low shrubs; watched from the path.",
  ],
  [
    2,
    3,
    "09-18T11:05",
    "tree",
    "Yellow flower heads noted on a planted wattle beside the campus walk.",
  ],
  [
    1,
    4,
    "09-20T08:40",
    "birds",
    "A bird stayed in dense planting near the reed-edge path.",
  ],
  [
    2,
    5,
    "09-23T14:25",
    "tree",
    "Flowering branch photographed from the garden path; no plant material collected.",
  ],
  [
    3,
    1,
    "09-25T10:20",
    "pollinator",
    "Returned to the same flower bed; visitor activity noted during five minutes.",
  ],
  [
    4,
    2,
    "10-04T07:55",
    "birds",
    "One bird perched above the woodland path; no playback or feeding.",
  ],
  [
    5,
    3,
    "10-06T11:05",
    "tree",
    "Repeat tree visit from the same side; leaves and visible canopy noted.",
  ],
  [
    3,
    1,
    "10-08T10:20",
    "pollinator",
    "Blue-banded visitor briefly hovered between flowers; identification needs checking.",
  ],
  [
    5,
    4,
    "10-10T09:30",
    "tree",
    "Planted eucalypt foliage recorded beside the wetland approach, away from the water.",
  ],
  [
    5,
    0,
    "10-11T09:10",
    "tree",
    "Same tree and photo direction as September; visible foliage documented again.",
  ],
  [
    3,
    5,
    "10-12T14:25",
    "",
    "Single flower visitor seen on a small flowering border during a casual walk.",
  ],
  [
    5,
    0,
    "10-13T09:10",
    "tree",
    "Third monitoring visit; notes describe visible leaves without inferring tree health.",
  ],
  [
    3,
    6,
    "10-15T10:35",
    "",
    "Flower visitor photographed from the public garden entrance; no nest approached.",
  ],
  [
    0,
    2,
    "10-17T08:15",
    "birds",
    "Three lorikeets visited a flowering tree during a stationary watch.",
  ],
  [
    0,
    0,
    "10-18T09:10",
    "birds",
    "Lorikeets called from the canopy above the established monitoring path.",
  ],
  [
    2,
    3,
    "10-19T11:05",
    "tree",
    "Revisited the same wattle; flower heads and survey effort recorded.",
  ],
  [
    4,
    4,
    "10-20T08:40",
    "birds",
    "A perched kookaburra observed from a designated path; distance maintained.",
  ],
  [
    3,
    1,
    "10-21T10:20",
    "pollinator",
    "Fourth visit to the flowering edge. One more visit completes this demo protocol.",
  ],
  [
    3,
    7,
    "10-21T13:45",
    "",
    "Flower visitor passed through the courtyard planting during a short photo stop.",
  ],
  [
    0,
    5,
    "10-22T08:30",
    "birds",
    "Two lorikeets moved between garden trees during five minutes of observation.",
  ],
  [
    2,
    7,
    "10-22T11:15",
    "tree",
    "Wattle leaves and remaining flower heads documented beside the courtyard.",
  ],
  [
    null,
    6,
    "10-22T12:05",
    "",
    "Unidentified insect; sensitive-location example requiring additional review.",
  ],
];
export function seedState(s: State, publicSeed = false): State {
  const consent = activeConsent(s);
  if (!consent && !publicSeed) return s;
  const seeded: State = {
    ...s,
    mode: "Demo Explorer",
    startMode: "demo",
    xp: 640,
    claimed: ["tree", "spotter"],
    ecosystem: [0, 1, 2, 3, 4, 5],
    projects: s.projects?.length ? s.projects : initialProjects,
    tasks: [
      ...s.tasks,
      ...initialTasks.filter((t) => !s.tasks.some((old) => old.id === t.id)),
    ].map(enrichTask),
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
        createdAt: new Date(
          new Date(observedAt).getTime() + 5 * 60000,
        ).toISOString(),
        location: site.location,
        coordinates: site.coordinates,
        uncertainty: site.uncertainty,
        identification:
          id === null
            ? "Identification unconfirmed"
            : "User-confirmed demo identification",
        review:
          i === 20
            ? "Not submitted"
            : i % 7 === 0
              ? "Needs clarification"
              : i % 4 === 0
                ? "Demo reviewed"
                : "Awaiting review",
        reviewNotes:
          i % 7 === 0
            ? "Demo review: revisit the identification details and survey notes. No expert verification performed."
            : i % 4 === 0
              ? "Demo completeness check only; not a verified occurrence."
              : "",
        method:
          taskId === "pollinator" || taskId === "birds"
            ? "Timed stationary survey"
            : i % 2
              ? "Photo observation"
              : "Visual observation",
        notes: "Fictional demonstration visit. " + note,
        taskId,
        projectId:
          taskId === "tree" ? "urban-habitats" : taskId ? "seasonal-life" : "",
        siteId: site.id,
        consentId: consent?.id || "",
        sensitive: id === null,
        provenance: "Seeded demonstration · fictional observation",
        recordType: "HumanObservation" as const,
        research:
          i === 20
            ? { status: "private" as const }
            : {
                status: "submitted" as const,
                receiptId: `demo-receipt-${i + 1}`,
                submittedAt: new Date(
                  new Date(observedAt).getTime() + 5 * 60000,
                ).toISOString(),
                agreementVersion: consent?.version,
                scope: researchScope,
                events: [
                  {
                    action: "submitted" as const,
                    timestamp: new Date(
                      new Date(observedAt).getTime() + 5 * 60000,
                    ).toISOString(),
                  },
                ],
              },
        individuals: 1 + (i % 3),
        duration: taskId ? 5 : 2 + (i % 4),
        habitat: site.habitat,
        activity:
          id === 2 || id === 5
            ? "Foliage and flowering noted"
            : id === 3
              ? "Visiting flowers"
              : "Observed from path",
        weather: [
          "Example: clear",
          "Example: light cloud",
          "Example: light breeze",
        ][i % 3],
      };
    }),
  };
  return publicSeed ? prepareShowcaseState(seeded) : seeded;
}
/** Built-in learning stories are never visitor consent or real research submissions. */
export function prepareShowcaseState(s: State): State {
  return {
    ...s,
    showcaseVersion: 1,
    mode: "Nature Scout",
    tasks: s.tasks.map((t) => ({
      ...t,
      instructions: t.instructions
        .replace("This prototype records", "This protocol records")
        .replace(" Use the demo samples for the presentation.", ""),
    })),
    projects: s.projects.map((p) => ({
      ...p,
      description: p.description.replace(
        "A demonstration of repeated community observations",
        "A learning project about repeated observations",
      ),
    })),
    observations: s.observations.map((o) => {
      const builtIn =
        o.synthetic ||
        (/^sample-(?:[1-9]|1[0-9]|2[0-4])$/.test(o.id) &&
          o.provenance.startsWith("Seeded demonstration") &&
          !o.photo);
      if (!builtIn) return o;
      return {
        ...o,
        synthetic: true,
        consentId: "",
        identification: "Unverified identification",
        review:
          o.review === "Demo reviewed"
            ? "Details checked"
            : o.review === "Awaiting review"
              ? "Unverified"
              : o.review,
        reviewNotes: o.reviewNotes
          .replace("Demo review: ", "")
          .replace("Demo completeness check only", "Completeness check only"),
        notes: o.notes
          .replace("Fictional demonstration visit. ", "")
          .replace("demo protocol", "protocol"),
        provenance: "Fictional learning record · unverified",
        research:
          o.research?.status === "submitted" ||
          o.research?.status === "illustrative"
            ? { status: "illustrative" as const }
            : { status: "private" as const },
      };
    }),
  };
}
export const returningState = (): State => seedState(emptyState(), true);
function normaliseObservation(
  o: Observation,
  consents: Consent[],
): Observation {
  const defaults: Partial<Observation> = {
    contributor: "Not recorded",
    provisional: "",
    createdAt: "",
    uncertainty: 0,
    identification: "Identification unconfirmed",
    review: "Not submitted",
    reviewNotes: "",
    method: "Not recorded",
    notes: "",
    taskId: "",
    siteId: "",
    consentId: "",
    sensitive: false,
    provenance: "Legacy observation · incomplete metadata",
    recordType: "HumanObservation",
    individuals: 0,
    duration: 0,
    habitat: "Not recorded",
    activity: "",
    weather: "",
  };
  const next = { ...o };
  const missing = [...(o.missingFields || [])];
  for (const [field, value] of Object.entries(defaults)) {
    if (
      next[field as keyof Observation] === undefined ||
      next[field as keyof Observation] === null
    ) {
      Object.assign(next, { [field]: value });
      missing.push(field);
    }
  }
  if (!Number.isInteger(o.speciesId) || !species[o.speciesId!]) {
    next.speciesId = null;
    next.provisional = o.provisional || "Unconfirmed organism";
  }
  if (
    next.coordinates &&
    (!Number.isFinite(next.coordinates.lat) ||
      !Number.isFinite(next.coordinates.lon) ||
      Math.abs(next.coordinates.lat) > 90 ||
      Math.abs(next.coordinates.lon) > 180)
  ) {
    delete next.coordinates;
    missing.push("coordinates");
  }
  if (missing.length) next.missingFields = [...new Set(missing)];
  next.research =
    o.research ||
    (consents.some(
      (c) => c.id === o.consentId && c.accepted && c.version === "1.0",
    )
      ? {
          status: "submitted",
          receiptId: `legacy-receipt-${o.id}`,
          submittedAt: o.createdAt,
          agreementVersion: "1.0",
          scope:
            "Shared under the recorded version 1.0 participation agreement.",
        }
      : { status: "private" });
  return next;
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
    observations: base.observations.map((o) =>
      normaliseObservation(o, base.consents),
    ),
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
  return !input.startMode &&
    !base.observations.length &&
    !base.xp &&
    !base.claimed.length &&
    !base.ecosystem.length &&
    activeConsent(base)
    ? seedState(migrated)
    : migrated;
}
export const biomeFor = (id: number): BiomeId =>
  id === 5 ? "wetland" : id === 2 || id === 3 ? "meadow" : "woodland";
export const biomeLabel = (id: number) =>
  ({ meadow: "Meadow", woodland: "Woodland", wetland: "Misty Grove" })[
    biomeFor(id)
  ];
export function taskDestination(t: Task, s: State): Site | undefined {
  if (t.recommendedSiteId)
    return (
      s.sites.find((site) => site.id === t.recommendedSiteId) ||
      exampleSites.find((site) => site.id === t.recommendedSiteId)
    );
  const previous = s.observations.find(
    (o) => o.taskId === t.id && o.siteId && !o.sensitive,
  );
  return previous &&
    !s.observations.some((o) => o.siteId === previous.siteId && o.sensitive)
    ? s.sites.find((site) => site.id === previous.siteId && !!site.coordinates)
    : undefined;
}
let memoryState: State | undefined;
const defaultState = () => (config.showcase ? returningState() : emptyState());
const recoverState = () => ({ ...defaultState(), recoveryRequired: true });
export const repository = {
  load(): State {
    if (memoryState?.storageUnavailable) return memoryState;
    let raw: string | null;
    try {
      raw = localStorage.getItem(config.storageKey);
    } catch {
      return memoryState || { ...defaultState(), storageUnavailable: true };
    }
    try {
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      if (
        !s ||
        !Array.isArray(s.consents) ||
        !Array.isArray(s.observations) ||
        !s.observations.every(
          (o: Observation) =>
            o &&
            typeof o.id === "string" &&
            typeof o.observedAt === "string" &&
            typeof o.location === "string",
        )
      )
        return recoverState();
      if (
        ["claimed", "ecosystem", "tasks", "sites", "projects"].some(
          (key) => s[key] !== undefined && !Array.isArray(s[key]),
        )
      )
        return recoverState();
      const migrated = migrateState(s);
      return config.showcase ? prepareShowcaseState(migrated) : migrated;
    } catch {
      return recoverState();
    }
  },
  save(s: State) {
    if (s.recoveryRequired)
      throw new Error(
        "Saved data needs recovery. The original browser data has been preserved.",
      );
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(s));
      memoryState = s;
    } catch (error) {
      if (error instanceof DOMException && error.name === "SecurityError") {
        memoryState = { ...s, storageUnavailable: true };
      } else throw error;
    }
  },
  temporary: () => !!memoryState?.storageUnavailable,
};
export function exportRows(rows: Observation[]) {
  return rows.map((o) => ({
    occurrenceID: o.id,
    eventDate: o.observedAt,
    scientificName: o.speciesId === null ? "" : species[o.speciesId].latin,
    vernacularName:
      o.speciesId === null ? o.provisional : species[o.speciesId].name,
    locality: o.sensitive ? "Restricted" : o.location,
    coordinateUncertaintyInMeters:
      o.sensitive || o.missingFields?.includes("uncertainty")
        ? ""
        : o.uncertainty,
    samplingProtocol: o.method,
    basisOfRecord: o.recordType,
    individualCount: o.missingFields?.includes("individuals")
      ? ""
      : o.individuals,
    samplingEffort: o.missingFields?.includes("duration") ? "" : o.duration,
    identificationVerificationStatus: o.identification,
    reviewStatus: o.review,
    taskId: o.taskId,
    projectId: o.projectId || "",
    observationSiteID: o.sensitive ? "Restricted" : o.siteId,
    consentRecordId: o.consentId,
    provenance: o.provenance,
    ...(o.synthetic
      ? {
          dataStatus:
            "Fictional learning record; not a verified occurrence or research submission",
        }
      : {}),
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
