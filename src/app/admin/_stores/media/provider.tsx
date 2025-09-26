"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type MediaStore, createMediaStore } from "./store";

export type MediaStoreApi = ReturnType<typeof createMediaStore>;

export const MediaStoreContext = createContext<MediaStoreApi | null>(null);

export interface MediaStoreProviderProps {
  children: ReactNode;
}

export const MediaStoreProvider = ({ children }: MediaStoreProviderProps) => {
  const storeRef = useRef<MediaStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createMediaStore();
    console.log("storeRef.current", storeRef.current);
  }

  return (
    <MediaStoreContext.Provider value={storeRef.current}>
      {children}
    </MediaStoreContext.Provider>
  );
};

export const useMediaStore = <T,>(selector: (store: MediaStore) => T): T => {
  const mediaStoreContext = useContext(MediaStoreContext);

  if (!mediaStoreContext) {
    throw new Error(`useMediaStore must be used within MediaStoreProvider`);
  }

  return useStore(mediaStoreContext, selector);
};
