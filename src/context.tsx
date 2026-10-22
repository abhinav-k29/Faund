import React, { createContext, useContext } from "react";
import { State } from "./store";
export type Draft = {
  photo?: string;
  uncertain?: boolean;
  taskId?: string;
  siteId?: string;
  provenance?: string;
};
export type AppContext = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  toast: (s: string) => void;
};
export const Context = createContext<AppContext>(null!);
export const useApp = () => useContext(Context);
