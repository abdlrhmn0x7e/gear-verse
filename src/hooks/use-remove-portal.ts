import { useLayoutEffect, useRef } from "react";

export function useRemovePortal() {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(
    () => () => {
      if (ref.current) {
        ref.current.style.display = "none";
      }
    },
    [],
  );

  return ref;
}
