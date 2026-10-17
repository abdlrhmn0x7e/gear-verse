"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CarouselApi } from "~/components/ui/carousel";

export function useCarouselProgress(api: CarouselApi) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!api) return () => undefined;

      api.on("select", onStoreChange).on("reInit", onStoreChange);
      return () => {
        api.off("select", onStoreChange).off("reInit", onStoreChange);
      };
    },
    [api],
  );

  const current = useSyncExternalStore(
    subscribe,
    () => (api ? api.selectedScrollSnap() + 1 : 0),
    () => 0,
  );
  const count = useSyncExternalStore(
    subscribe,
    () => api?.scrollSnapList().length ?? 0,
    () => 0,
  );

  return { current, count };
}
