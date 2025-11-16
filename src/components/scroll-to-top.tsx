"use client";

import { IconArrowUp } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "~/hooks/use-debounce-callback";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export function ScrollToTop() {
  const [scrollY, setScrollY] = useState(0);
  const handleScrollToTop = useCallback(() => {
    if (!window) return;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setScrollYCB = useDebouncedCallback((y: number) => setScrollY(y));
  useEffect(() => {
    const handleScrollEvent = () => {
      if (!window) return;

      setScrollYCB(window.scrollY);
    };

    document.addEventListener("scroll", handleScrollEvent);

    return () => document.removeEventListener("scroll", handleScrollEvent);
  }, [setScrollYCB]);

  return (
    <Button
      size="icon-lg"
      className={cn(
        "fixed right-4 bottom-8",
        scrollY > 100 ? "animate-item-in" : "animate-item-out",
      )}
      onClick={handleScrollToTop}
    >
      <IconArrowUp />
    </Button>
  );
}
