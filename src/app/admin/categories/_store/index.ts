import { createStore } from "zustand/vanilla";

export type CategoryState = {
  /** The category open in the details pane. */
  selectedCategoryId: number | null;
};

export type CategoryActions = {
  setSelectedCategoryId: (id: number | null) => void;
};

export type CategoryStore = CategoryState & CategoryActions;

export const defaultInitState: CategoryState = {
  selectedCategoryId: null,
};

export const createCategoryStore = (
  initState: CategoryState = defaultInitState,
) => {
  return createStore<CategoryStore>()((set) => ({
    ...initState,
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  }));
};
