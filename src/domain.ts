import { species } from "./data";
import { config } from "./config";
import type { Observation, State, Task, ResearchPermission } from "./store";

export const activeConsent = (s: State) => {
  const c = s.consents.at(-1);
  return c?.accepted && !c.withdrawnAt && c.version === config.consentVersion
    ? c
    : undefined;
};
export const speciesIds = (s: State) => [
  ...new Set(
    s.observations.flatMap((o) =>
      Number.isInteger(o.speciesId) && species[o.speciesId!]
        ? [o.speciesId!]
        : [],
    ),
  ),
];
export function characterProgress(s: State, id: number) {
  const growth = Math.max(
    0,
    Math.min(300, Number(s.game.characterGrowth[id]) || 0),
  );
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
export function taskProgress(t: Task, s: State) {
  if (s.claimed.includes(t.id)) return 1; // A completed task is a historical achievement.
  if (t.id === "spotter" || t.id === "leaf") {
    const category = t.id === "spotter" ? "Birds" : "Plants";
    return Math.min(
      1,
      speciesIds(s).filter((id) => species[id].category === category).length /
        2,
    );
  }
  const visits = s.observations.filter(
    (o) =>
      o.taskId === t.id &&
      (!t.requiredCategory ||
        t.requiredCategory === "All" ||
        (o.speciesId === null
          ? o.provisional
          : species[o.speciesId]?.category) === t.requiredCategory) &&
      o.duration >= t.duration &&
      (!t.requiresNotes || !!o.notes.trim()) &&
      (!t.requiresSite || !!o.siteId) &&
      Number.isFinite(Date.parse(o.observedAt)),
  );
  const required = Math.max(1, t.repeatVisits || 1);
  if (required === 1) return Math.min(1, visits.length);
  const counts = new Map<string, Set<number>>();
  for (const o of visits) {
    if (!o.siteId || !Number.isFinite(Date.parse(o.observedAt))) continue;
    const times = counts.get(o.siteId) || new Set<number>();
    times.add(Date.parse(o.observedAt));
    counts.set(o.siteId, times);
  }
  return Math.min(
    1,
    Math.max(0, ...[...counts.values()].map((times) => times.size)) / required,
  );
}
export function claimTaskReward(s: State, id: string): State {
  const task = s.tasks.find((t) => t.id === id && t.status === "Published");
  if (
    !activeConsent(s) ||
    !task ||
    s.claimed.includes(id) ||
    taskProgress(task, s) < 1
  )
    return s;
  return {
    ...s,
    claimed: [...s.claimed, id],
    xp: s.xp + task.reward,
    game: {
      ...s.game,
      availableGrowthXP: s.game.availableGrowthXP + task.reward,
    },
  };
}
export function validateObservation(
  o: Observation,
  s: State,
  now = Date.now(),
): string | undefined {
  const consent = activeConsent(s);
  if (!consent || o.consentId !== consent.id)
    return "Review the current participation agreement before saving.";
  if (
    o.speciesId !== null &&
    (!Number.isInteger(o.speciesId) || !species[o.speciesId])
  )
    return "Choose a supported species or keep the identification unconfirmed.";
  if (o.speciesId === null && !o.provisional?.trim())
    return "Choose a general category for an unconfirmed discovery.";
  const date = Date.parse(o.observedAt);
  if (!Number.isFinite(date) || date > now + 5 * 60 * 1000)
    return "Choose a valid observation date and time that is not in the future.";
  if (!o.location?.trim() || o.location.length > 200)
    return "Enter a location description of up to 200 characters.";
  if (
    !Number.isFinite(o.uncertainty) ||
    o.uncertainty < 1 ||
    o.uncertainty > 100000
  )
    return "Location uncertainty must be between 1 and 100,000 metres.";
  if (
    o.coordinates &&
    (!Number.isFinite(o.coordinates.lat) ||
      !Number.isFinite(o.coordinates.lon) ||
      Math.abs(o.coordinates.lat) > 90 ||
      Math.abs(o.coordinates.lon) > 180)
  )
    return "The recorded coordinates are invalid. Choose a saved site or try location again.";
  if (
    !Number.isInteger(o.individuals) ||
    o.individuals < 1 ||
    o.individuals > 100000
  )
    return "Enter a whole number of individuals between 1 and 100,000.";
  if (!Number.isFinite(o.duration) || o.duration < 0 || o.duration > 1440)
    return "Survey effort must be between 0 and 1,440 minutes.";
  if (o.notes.length > 4000)
    return "Keep observation notes within 4,000 characters.";
  if (
    ![
      "Visual observation",
      "Photo observation",
      "Timed stationary survey",
    ].includes(o.method)
  )
    return "Choose a supported observation method.";
  if (o.taskId) {
    const task = s.tasks.find(
      (t) => t.id === o.taskId && t.status === "Published",
    );
    if (!task)
      return "This task is not currently published. Choose an available protocol.";
    const category =
      o.speciesId === null ? o.provisional : species[o.speciesId].category;
    if (
      task.requiredCategory &&
      task.requiredCategory !== "All" &&
      category !== task.requiredCategory
    )
      return `This task requires an observation of ${task.requiredCategory.toLowerCase()}.`;
    if (o.duration < task.duration)
      return `This task requires at least ${task.duration} minutes of effort.`;
    if ((task.requiresNotes || task.id === "tree") && !o.notes.trim())
      return "This research protocol requires observation notes.";
    if ((task.requiresSite || (task.repeatVisits || 1) > 1) && !o.siteId)
      return "This protocol requires a named observation site for repeat monitoring.";
    if (o.projectId !== (task.projectId || ""))
      return "The observation project must match its task.";
  }
}
const eventKey = (o: Observation) =>
  JSON.stringify([
    o.speciesId,
    o.provisional,
    Date.parse(o.observedAt),
    o.siteId,
    o.location.trim().toLowerCase(),
    o.taskId,
    o.photo || "",
  ]);
export function recordDiscovery(
  s: State,
  o: Observation,
): { state: State; observation: Observation; created: boolean } {
  const error = validateObservation(o, s);
  if (error) throw new Error(error);
  const previous = s.observations.find(
    (existing) => existing.id === o.id || eventKey(existing) === eventKey(o),
  );
  if (previous) return { state: s, observation: previous, created: false };
  const growth =
    o.speciesId === null
      ? s.game.characterGrowth
      : {
          ...s.game.characterGrowth,
          [o.speciesId]: Math.min(
            300,
            characterProgress(s, o.speciesId).growth + 10,
          ),
        };
  return {
    state: {
      ...s,
      observations: [...s.observations, o],
      xp: s.xp + 20,
      game: {
        ...s.game,
        availableGrowthXP: s.game.availableGrowthXP + 10,
        characterGrowth: growth,
      },
    },
    observation: o,
    created: true,
  };
}
export function deleteObservation(s: State, id: string): State {
  const observations = s.observations.filter((o) => o.id !== id);
  const owned = speciesIds({ ...s, observations });
  return {
    ...s,
    observations,
    ecosystem: s.ecosystem.filter((id) => owned.includes(id)),
    game: {
      ...s.game,
      activeCompanionId:
        s.game.activeCompanionId !== null &&
        owned.includes(s.game.activeCompanionId)
          ? s.game.activeCompanionId
          : null,
      characterGrowth: Object.fromEntries(
        Object.entries(s.game.characterGrowth).filter(([id]) =>
          owned.includes(Number(id)),
        ),
      ),
    },
  };
}
export const researchScope =
  "Organism photo, identification and uncertainty, observation date/time, location and precision, method, effort, habitat and notes for the local biodiversity research demonstration. Sensitive locations and photos are restricted. No collection, companion or game profile is included.";
export function canResearchAccess(o: Observation, s: State) {
  return (
    !!activeConsent(s) &&
    o.research?.status === "submitted" &&
    !!o.research.receiptId &&
    s.consents.some(
      (c) =>
        c.id === (o.research?.agreementConsentId || o.consentId) &&
        c.accepted &&
        !c.withdrawnAt,
    )
  );
}
export const authorisedObservations = (s: State) =>
  s.observations.filter((o) => canResearchAccess(o, s));
export function submissionPermission(
  o: Observation,
  s: State,
  timestamp = new Date().toISOString(),
): ResearchPermission {
  const consent = activeConsent(s);
  if (!consent)
    throw new Error(
      "Research contribution requires the current participation agreement.",
    );
  if (canResearchAccess(o, s)) return o.research!;
  const events = [
    ...(o.research?.events || []),
    { action: "submitted" as const, timestamp },
  ];
  return {
    status: "submitted",
    receiptId: `research-${o.id}-${events.length}`,
    submittedAt: timestamp,
    agreementVersion: consent.version,
    agreementConsentId: consent.id,
    scope: researchScope,
    events,
  };
}
export function submitResearch(s: State, id: string): State {
  if (!activeConsent(s)) return s;
  return {
    ...s,
    observations: s.observations.map((o) =>
      o.id === id
        ? {
            ...o,
            research: submissionPermission(o, s),
            review: canResearchAccess(o, s) ? o.review : "Awaiting review",
          }
        : o,
    ),
  };
}
export function withdrawResearch(s: State, id: string): State {
  const timestamp = new Date().toISOString();
  return {
    ...s,
    observations: s.observations.map((o) =>
      o.id === id && o.research?.status === "submitted"
        ? {
            ...o,
            research: {
              ...o.research,
              status: "withdrawn",
              withdrawnAt: timestamp,
              events: [
                ...(o.research.events || []),
                { action: "withdrawn", timestamp },
              ],
            },
          }
        : o,
    ),
  };
}
