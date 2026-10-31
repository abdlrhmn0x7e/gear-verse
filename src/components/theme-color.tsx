"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

// --background in globals.css (white, and the dark theme's neutral-900) as hex; the admin shares both
const THEME_COLORS = { light: "#ffffff", dark: "#1b151b" } as const;

// next-themes' storage key and default; the site stays light until someone picks dark or system
const themeColorScript = `(function(){try{var t=localStorage.getItem("theme")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var m=document.createElement("meta");m.name="theme-color";m.content=t==="dark"?"${THEME_COLORS.dark}":"${THEME_COLORS.light}";document.head.appendChild(m)}catch(e){}})()`;

/**
 * The browser toolbar colour, following the site's theme rather than the phone's. The meta is created by a script
 * before first paint and only ever touched from here: a React-rendered meta is matched by its content on hydration,
 * so one already switched to dark would be left behind next to a fresh light one.
 */
export function ThemeColorScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeColorScript }} />;
}

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = THEME_COLORS[resolvedTheme];
  }, [resolvedTheme]);

  return null;
}
