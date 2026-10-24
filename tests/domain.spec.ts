import { test, expect } from "@playwright/test";
import {
  emptyState,
  makeConsent,
  seedState,
  activeConsent,
  speciesIds,
  characterProgress,
  feedCharacter,
  taskProgress,
  claimTaskReward,
  validateObservation,
  recordDiscovery,
  deleteObservation,
  authorisedObservations,
  submitResearch,
  withdrawResearch,
  csvText,
  migrateState,
  repository,
  type Observation,
  type State,
} from "../src/store";
import { config } from "../src/config";
const fresh = () => ({ ...emptyState("fresh"), consents: [makeConsent(true)] });
const record = (s: State, changes: Partial<Observation> = {}): Observation => ({
  id: "event-1",
  contributor: config.participantId,
  speciesId: 3,
  provisional: "",
  observedAt: new Date(Date.now() - 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  location: "Example public garden",
  uncertainty: 100,
  identification: "User-confirmed demo identification",
  review: "Not submitted",
  reviewNotes: "",
  method: "Visual observation",
  notes: "A fictional flower visitor record.",
  taskId: "",
  siteId: "",
  consentId: s.consents.at(-1)!.id,
  sensitive: false,
  provenance: "Unit test · fictional",
  recordType: "HumanObservation",
  individuals: 1,
  duration: 5,
  habitat: "Garden",
  activity: "Flower visitor",
  weather: "Not recorded",
  projectId: "",
  research: { status: "private" },
  ...changes,
});

test("latest consent, withdrawal and version govern participation", () => {
  const s = fresh();
  expect(activeConsent(s)).toBeTruthy();
  expect(
    activeConsent({ ...s, consents: [...s.consents, makeConsent(false)] }),
  ).toBeUndefined();
  expect(
    activeConsent({
      ...s,
      consents: [{ ...s.consents[0], withdrawnAt: new Date().toISOString() }],
    }),
  ).toBeUndefined();
  expect(
    activeConsent({ ...s, consents: [{ ...s.consents[0], version: "1.0" }] }),
  ).toBeUndefined();
});
test("observation validation rejects invalid scientific inputs and dates", () => {
  const s = fresh(),
    o = record(s);
  expect(validateObservation(o, s)).toBeUndefined();
  for (const change of [
    { speciesId: 999 },
    { observedAt: "not a date" },
    { observedAt: new Date(Date.now() + 86400000).toISOString() },
    { coordinates: { lat: 91, lon: 0 } },
    { uncertainty: NaN },
    { duration: -1 },
    { individuals: 1.2 },
    { method: "invented method" },
    { notes: "a".repeat(4001) },
    { consentId: "forged" },
  ])
    expect(
      validateObservation({ ...o, ...change } as Observation, s),
    ).toBeTruthy();
  expect(
    validateObservation({ ...o, speciesId: null, provisional: "Insects" }, s),
  ).toBeUndefined();
});
test("one field event grants XP once while genuinely separate visits remain distinct", () => {
  let s = fresh();
  const o = record(s);
  s = recordDiscovery(s, o).state;
  expect(s.xp).toBe(20);
  expect(s.game.characterGrowth[3]).toBe(10);
  for (let i = 0; i < 30; i++)
    s = recordDiscovery(s, { ...o, id: "repeat-" + i }).state;
  expect(s.observations).toHaveLength(1);
  expect(s.xp).toBe(20);
  s = recordDiscovery(s, {
    ...o,
    id: "second-visit",
    observedAt: new Date(Date.parse(o.observedAt) + 60000).toISOString(),
  }).state;
  expect(s.observations).toHaveLength(2);
  expect(s.xp).toBe(40);
  expect(speciesIds(s)).toEqual([3]);
});
test("uncertain records never unlock a species companion", () => {
  const s = fresh();
  const next = recordDiscovery(
    s,
    record(s, { speciesId: null, provisional: "Insects" }),
  ).state;
  expect(speciesIds(next)).toEqual([]);
  expect(next.game.characterGrowth).toEqual({});
});
test("task validation enforces category, notes, effort and linked project", () => {
  const s = fresh(),
    task = s.tasks.find((t) => t.id === "tree")!,
    o = record(s, { speciesId: 2, taskId: task.id, projectId: task.projectId });
  expect(validateObservation(o, s)).toBeUndefined();
  for (const change of [
    { speciesId: 3 },
    { notes: "" },
    { duration: 1 },
    { projectId: "wrong-project" },
  ])
    expect(validateObservation({ ...o, ...change }, s)).toBeTruthy();
});
test("repeat tasks count distinct instants at the same site and cap progress", () => {
  const s = fresh(),
    t = { ...s.tasks.find((t) => t.id === "pollinator")!, repeatVisits: 2 };
  const a = record(s, {
    taskId: t.id,
    projectId: t.projectId,
    siteId: "site-a",
    observedAt: "2026-10-20T10:00:00+11:00",
  });
  const b = { ...a, id: "event-2", observedAt: "2026-10-19T23:00:00Z" };
  expect(taskProgress(t, { ...s, observations: [a, b] })).toBe(0.5);
  expect(
    taskProgress(t, {
      ...s,
      observations: [
        a,
        { ...b, siteId: "site-b", observedAt: "2026-10-21T10:00:00+11:00" },
      ],
    }),
  ).toBe(0.5);
  expect(
    taskProgress(t, {
      ...s,
      observations: [a, { ...b, observedAt: "2026-10-21T10:00:00+11:00" }],
    }),
  ).toBe(1);
});
test("rewards require eligibility and survive rapid repeated claims exactly once", () => {
  let s = fresh();
  expect(claimTaskReward(s, "tree")).toBe(s);
  const t = s.tasks.find((t) => t.id === "tree")!;
  s = recordDiscovery(
    s,
    record(s, { speciesId: 2, taskId: "tree", projectId: t.projectId }),
  ).state;
  for (let i = 0; i < 50; i++) s = claimTaskReward(s, "tree");
  expect(s.xp).toBe(60);
  expect(s.claimed).toEqual(["tree"]);
  expect(s.game.availableGrowthXP).toBe(50);
  const removed = deleteObservation(s, s.observations[0].id);
  expect(taskProgress(t, removed)).toBe(1);
});
test("feeding cannot overdraw, grant ownership or mutate scientific records", () => {
  const s = seedState(fresh()),
    science = JSON.stringify(s.observations),
    xp = s.xp;
  const next = feedCharacter(s, 3);
  expect(next.game.availableGrowthXP).toBe(s.game.availableGrowthXP - 10);
  expect(next.xp).toBe(xp);
  expect(JSON.stringify(next.observations)).toBe(science);
  expect(
    feedCharacter({ ...s, game: { ...s.game, availableGrowthXP: 0 } }, 3).game
      .characterGrowth,
  ).toEqual(s.game.characterGrowth);
  expect(feedCharacter(fresh(), 3).observations).toHaveLength(0);
  expect(
    characterProgress(
      { ...s, game: { ...s.game, characterGrowth: { 3: 999 } } },
      3,
    ),
  ).toMatchObject({ growth: 300, stage: 3 });
});
test("deleting the last discovery reconciles world and active companion ownership", () => {
  const s = fresh(),
    next = recordDiscovery(s, record(s)).state;
  next.ecosystem = [3];
  next.game.activeCompanionId = 3;
  const removed = deleteObservation(next, "event-1");
  expect(speciesIds(removed)).toEqual([]);
  expect(removed.ecosystem).toEqual([]);
  expect(removed.game.activeCompanionId).toBeNull();
  expect(removed.game.characterGrowth).toEqual({});
  expect(removed.xp).toBe(20);
});
test("private records require explicit research permission and get an idempotent receipt", () => {
  let s = fresh();
  s = recordDiscovery(s, record(s)).state;
  expect(authorisedObservations(s)).toEqual([]);
  s = submitResearch(s, "event-1");
  expect(authorisedObservations(s)).toHaveLength(1);
  const receipt = s.observations[0].research;
  expect(receipt?.agreementConsentId).toBe(s.consents[0].id);
  s = submitResearch(s, "event-1");
  expect(s.observations[0].research).toEqual(receipt);
  const withdrawn = withdrawResearch(s, "event-1");
  expect(authorisedObservations(withdrawn)).toEqual([]);
  expect(withdrawn.observations).toHaveLength(1);
  expect(withdrawn.observations[0].research?.events).toHaveLength(2);
  const again = submitResearch(withdrawn, "event-1");
  expect(authorisedObservations(again)).toHaveLength(1);
  expect(again.observations[0].research?.receiptId).not.toBe(
    receipt?.receiptId,
  );
});
test("withdrawn agreements and forged permissions do not reach researcher selectors", () => {
  let s = seedState(fresh());
  expect(authorisedObservations(s)).toHaveLength(23);
  s = {
    ...s,
    consents: s.consents.map((c) => ({
      ...c,
      withdrawnAt: new Date().toISOString(),
    })),
  };
  expect(authorisedObservations(s)).toEqual([]);
  const original = fresh(),
    o = record(original, {
      consentId: "missing",
      research: { status: "submitted", receiptId: "forged" },
    });
  expect(authorisedObservations({ ...original, observations: [o] })).toEqual(
    [],
  );
});
test("CSV excludes sensitive localities and exact coordinates and escapes formulas", () => {
  const s = fresh(),
    o = record(s, {
      location: "Sensitive secret",
      siteId: "hidden-site",
      coordinates: { lat: -33.12345, lon: 151.12345 },
      sensitive: true,
      provisional: '=HYPERLINK("bad")',
      speciesId: null,
    });
  const csv = csvText([o]);
  expect(csv).not.toContain("Sensitive secret");
  expect(csv).not.toContain("hidden-site");
  expect(csv).not.toContain("-33.12345");
  expect(csv).toContain("Restricted");
  expect(csv).toContain("'=HYPERLINK");
});
test("migration retains legacy records, consent and earned XP with explicit legacy receipts", () => {
  const s = fresh();
  s.consents[0].version = "1.0";
  const o = record(s);
  delete o.research;
  const { game, ...legacy } = s;
  const next = migrateState({ ...legacy, observations: [o], xp: 777 });
  expect(next.observations[0].id).toBe(o.id);
  expect(next.observations[0].notes).toBe(o.notes);
  expect(next.xp).toBe(777);
  expect(next.consents).toEqual(s.consents);
  expect(next.observations[0].research?.agreementVersion).toBe("1.0");
  expect(next.game.characterGrowth[3]).toBeDefined();
});
test("malformed stored JSON is preserved rather than overwritten by an empty journal", () => {
  const data = new Map([[config.storageKey, "{broken-private-data"]]);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) || null,
      setItem: (key: string, value: string) => data.set(key, value),
    },
  });
  const s = repository.load();
  expect(s.recoveryRequired).toBe(true);
  expect(() => repository.save(s)).toThrow("recovery");
  expect(data.get(config.storageKey)).toBe("{broken-private-data");
});
test("partial legacy metadata is labelled unknown without inventing measurements", () => {
  const s = fresh();
  const partial = {
    id: "partial",
    observedAt: "2026-10-20",
    location: "Example area",
    speciesId: 999,
  } as Observation;
  const next = migrateState({ ...s, observations: [partial] });
  const o = next.observations[0];
  expect(o.speciesId).toBeNull();
  expect(o.provisional).toBe("Unconfirmed organism");
  expect(o.missingFields).toContain("duration");
  expect(o.research?.status).toBe("private");
  const csv = csvText([o]);
  expect(csv).toContain("Unconfirmed organism");
  expect(o.notes).toBe("");
});
test("incomplete visits do not satisfy a researcher notes/site protocol", () => {
  const s = fresh(),
    t = s.tasks.find((t) => t.id === "pollinator")!,
    o = record(s, {
      taskId: t.id,
      projectId: t.projectId,
      siteId: "site-a",
      notes: "",
    });
  expect(taskProgress(t, { ...s, observations: [o] })).toBe(0);
});
