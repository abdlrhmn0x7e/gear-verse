import { createStore } from "zustand/vanilla";
import type { RouterOutput } from "~/trpc/client";

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];

export type AttributeState = {
  selectedAttribute: Attribute | null;
};

export type AttributeActions = {
  setSelectedAttribute: (attribute: Attribute) => void;
};

export type AttributeStore = AttributeState & AttributeActions;

export const defaultInitState: AttributeState = {
  selectedAttribute: null,
};

export const createAttributeStore = (
  initState: AttributeState = defaultInitState,
) => {
  return createStore<AttributeStore>()((set) => ({
    ...initState,
    setSelectedAttribute: (attribute) => set({ selectedAttribute: attribute }),
  }));
};
