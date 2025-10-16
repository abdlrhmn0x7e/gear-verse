import { createStore } from "zustand/vanilla";
import type { RouterOutputs } from "~/trpc/react";

export type VariantSelectionState = {
  variantId: number | null;
  selectedOptions: Record<string, string>;
};

export type VariantSelectionActions = {
  setSelectedOptions: (options: Record<string, string>) => void;
  updateSelectedOption: (
    optionName: string,
    value: string,
    availableVariants?: RouterOutputs["public"]["products"]["queries"]["findBySlug"]["variants"],
  ) => void;
  setVariantId: (variantId: number) => void;
  clear: () => void;
};

export type VariantSelectionStore = VariantSelectionState &
  VariantSelectionActions;

export const defaultInitState: VariantSelectionState = {
  variantId: null,
  selectedOptions: {},
};

export const createVariantSelectionStore = (
  initState: VariantSelectionState = defaultInitState,
) => {
  return createStore<VariantSelectionStore>()((set, get) => ({
    ...initState,

    setSelectedOptions: (options) => {
      set({ selectedOptions: options });
    },

    updateSelectedOption: (optionName, value, availableVariants = []) => {
      const state = get();
      const desired = { ...state.selectedOptions, [optionName]: value };

      // Try exact match first
      let newVariant = availableVariants?.find((v) =>
        Object.entries(desired).every(
          ([name, val]) => v.optionValues[name] === val,
        ),
      );

      if (newVariant) {
        set({
          selectedOptions: newVariant.optionValues,
          variantId: newVariant.id,
        });
        return;
      }

      // Fall back to any variant matching the changed option
      newVariant = availableVariants?.find(
        (v) => v.optionValues[optionName] === value,
      );
      if (newVariant) {
        set({
          selectedOptions: newVariant.optionValues,
          variantId: newVariant.id,
        });
      } else {
        // Just update the option without changing variant
        set({
          selectedOptions: desired,
        });
      }
    },

    setVariantId: (variantId) => {
      set({ variantId });
    },

    clear: () => {
      set(defaultInitState);
    },
  }));
};
