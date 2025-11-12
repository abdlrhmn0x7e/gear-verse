"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type AttributeStore, createAttributeStore } from ".";

export type AttributeStoreApi = ReturnType<typeof createAttributeStore>;

export const AttributeStoreContext = createContext<AttributeStoreApi | null>(
  null,
);

export interface AttributeStoreProviderProps {
  children: ReactNode;
}

export const AttributeStoreProvider = ({
  children,
}: AttributeStoreProviderProps) => {
  const storeRef = useRef<AttributeStoreApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (storeRef.current === null) {
    storeRef.current = createAttributeStore({
      selectedAttribute: null,
    });
  }

  return (
    <AttributeStoreContext.Provider value={storeRef.current}>
      {children}
    </AttributeStoreContext.Provider>
  );
};

export const useAttributeStore = <T,>(
  selector: (store: AttributeStore) => T,
): T => {
  const attributeStoreContext = useContext(AttributeStoreContext);

  if (!attributeStoreContext) {
    throw new Error(
      `useAttributeStore must be used within AttributeStoreProvider`,
    );
  }

  return useStore(attributeStoreContext, selector);
};
