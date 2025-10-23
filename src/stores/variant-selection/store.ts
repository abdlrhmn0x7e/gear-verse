import { createStore } from "zustand/vanilla";

export interface StoredVariant {
  id: number;
  thumbnailUrl: string;
  stock: number;
  overridePrice: number | null;
}

export type VariantSelectionState = {
  selectedVariant: StoredVariant | null;
};

export type VariantSelectionActions = {
  setSelectedVariant: (variant: StoredVariant) => void;
  clear: () => void;
};

export type VariantSelectionStore = VariantSelectionState &
  VariantSelectionActions;

export const defaultInitState: VariantSelectionState = {
  selectedVariant: null,
};

export const createVariantSelectionStore = (
  initState: VariantSelectionState = defaultInitState,
) => {
  return createStore<VariantSelectionStore>()((set) => ({
    ...initState,

    setSelectedVariant: (variant) => {
      set({
        selectedVariant: variant,
      });
    },

    clear: () => {
      set(defaultInitState);
    },
  }));
};
