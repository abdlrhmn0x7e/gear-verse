"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type MediaStore, createMediaStore } from "./store";

export type MediaStoreApi = ReturnType<typeof createMediaStore>;

export const MediaStoreContext = createContext<MediaStoreApi | null>(null);

export interface MediaStoreProviderProps {
  children: ReactNode;
  maxFiles?: number;
}

export const MediaStoreProvider = ({
  children,
  maxFiles,
}: MediaStoreProviderProps) => {
  const storeRef = useRef<MediaStoreApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (storeRef.current === null) {
    storeRef.current = createMediaStore({
      selectedMedia: [],
      previewUrl: null,
      maxFiles,
    });
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
