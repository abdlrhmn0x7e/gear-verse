"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";

/**
 * Eased wheel and trackpad scrolling for the storefront. Touch keeps the phone's own scrolling, reduced motion turns
 * the easing off, and the page stays put while a drawer or dialog locks it.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        // drawers and dialogs lock the page on <body>, which Lenis's own autoToggle doesn't watch
        prevent: () => document.body.style.overflow === "hidden",
        allowNestedScroll: true,
        anchors: true,
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
