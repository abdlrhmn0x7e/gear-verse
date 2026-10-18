"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

/**
 * Marks the chat once half of it is on screen, so its bubbles play in order the first time someone scrolls to it.
 * The bubbles only start hidden under motion-safe, so reduced motion shows the whole exchange at once.
 */
export function ChatReveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown ? "" : undefined}
      className={cn("group/chat", className)}
    >
      {children}
    </div>
  );
}
