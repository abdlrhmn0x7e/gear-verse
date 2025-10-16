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
  setVariantId: (variantId: number | null) => void;
  setVariantSelection: (
    variant:
      | NonNullable<
          RouterOutputs["public"]["products"]["queries"]["findBySlug"]["variants"]
        >[number]
      | null,
  ) => void;
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
        state.setVariantSelection(newVariant);
        return;
      }

      // Fall back to any variant matching the changed option
      newVariant = availableVariants?.find(
        (v) => v.optionValues[optionName] === value,
      );
      if (newVariant) {
        state.setVariantSelection(newVariant);
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

    setVariantSelection: (variant) => {
      if (!variant) {
        set({
          variantId: null,
          selectedOptions: {},
        });
        return;
      }

      set({
        variantId: variant.id,
        selectedOptions: variant.optionValues ?? {},
      });
    },

    clear: () => {
      set(defaultInitState);
    },
  }));
};
