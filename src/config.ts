const showcase =
  typeof __WILSEE_SHOWCASE__ !== "undefined" && __WILSEE_SHOWCASE__;
export const config = {
  showcase,
  homePath: showcase ? "/" : "/home",
  researchPath: showcase ? "/research" : "/researcher-demo",
  name: "Wilsee",
  tagline: "Find the wild. Keep the wonder.",
  storageKey: "nature-discovery-v1",
  consentVersion: "1.1",
  participantId: "explorer-demo-01",
};
