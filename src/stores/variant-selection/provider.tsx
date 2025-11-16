"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type VariantSelectionStore,
  createVariantSelectionStore,
} from "./store";

export type VariantSelectionStoreApi = ReturnType<
  typeof createVariantSelectionStore
>;

export const VariantSelectionStoreContext =
  createContext<VariantSelectionStoreApi | null>(null);

export interface VariantSelectionStoreProviderProps {
  children: ReactNode;
}

export const VariantSelectionStoreProvider = ({
  children,
}: VariantSelectionStoreProviderProps) => {
  const storeRef = useRef<VariantSelectionStoreApi | null>(null);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (storeRef.current === null) {
    storeRef.current = createVariantSelectionStore();
  }

  return (
    // eslint-disable-next-line react-hooks/refs
    <VariantSelectionStoreContext.Provider value={storeRef.current}>
      {children}
    </VariantSelectionStoreContext.Provider>
  );
};

export const useVariantSelectionStore = <T,>(
  selector: (store: VariantSelectionStore) => T,
): T => {
  const variantStoreContext = useContext(VariantSelectionStoreContext);

  if (!variantStoreContext) {
    throw new Error(
      `useVariantSelectionStore must be used within VariantSelectionStoreProvider`,
    );
  }

  return useStore(variantStoreContext, selector);
};
