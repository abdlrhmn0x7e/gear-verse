"use client";

import { useEffect, useState } from "react";

/** The fixed header gains its hairline border only once the page scrolls under it. */
export function NavShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="bg-background/80 supports-backdrop-filter:bg-background/70 fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-xl backdrop-saturate-150 transition-[border-color,background-color] duration-200 data-[scrolled=true]:border-border has-data-[state=open]:border-border has-data-[state=open]:bg-background"
    >
      {children}
    </header>
  );
}
