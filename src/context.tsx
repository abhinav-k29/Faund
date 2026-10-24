import React, { createContext, useContext } from "react";
import { State } from "./store";
export type Draft = {
  photo?: string;
  uncertain?: boolean;
  taskId?: string;
  siteId?: string;
  provenance?: string;
};
export const draftKey = "nature-discovery-v1:draft";
export function loadDraft(): Draft {
  try {
    const value = JSON.parse(sessionStorage.getItem(draftKey) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(([key, item]) =>
        key === "uncertain"
          ? typeof item === "boolean"
          : ["photo", "taskId", "siteId", "provenance"].includes(key) &&
            typeof item === "string",
      ),
    );
  } catch {
    return {};
  }
}
export type AppContext = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  toast: (s: string) => void;
};
export const Context = createContext<AppContext>(null!);
export const useApp = () => useContext(Context);
