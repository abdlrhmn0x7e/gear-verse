import { createStore } from "zustand/vanilla";
import type { RouterOutput } from "~/trpc/client";

type CategoryTree =
  RouterOutput["admin"]["categories"]["queries"]["findAll"][number];

export type CategoryState = {
  selectedCategory: CategoryTree | null;
  parentCategory: CategoryTree | null;
};

export type CategoryActions = {
  setSelectedCategory: (category: CategoryTree) => void;
  setParentCategory: (category: CategoryTree) => void;
};

export type CategoryStore = CategoryState & CategoryActions;

export const defaultInitState: CategoryState = {
  selectedCategory: null,
  parentCategory: null,
};

export const createCategoryStore = (
  initState: CategoryState = defaultInitState,
) => {
  return createStore<CategoryStore>()((set) => ({
    ...initState,
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setParentCategory: (category) => set({ parentCategory: category }),
  }));
};
