"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

/** Navbar light/dark switch. The theme is unknown on the server, so both icons render and the `dark` class picks one. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="Toggle dark mode"
      className={className}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="scale-100 rotate-0 transition-[scale,rotate] duration-200 dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute scale-0 rotate-90 transition-[scale,rotate] duration-200 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

/** Light/dark/system picker for menus. Render it only after mount (inside a closed-by-default drawer, for example), since the stored theme is client-only. */
export function ThemeSegmentedControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      aria-label="Theme"
      value={theme ? [theme] : []}
      // a single toggle group can be cleared by pressing the active item; the theme always keeps a value
      onValueChange={([value]) => value && setTheme(value)}
      className={cn("bg-accent flex rounded-full p-1", className)}
    >
      {THEME_OPTIONS.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="text-muted-foreground data-pressed:bg-background data-pressed:text-foreground focus-visible:outline-focus relative flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-150 outline-none focus-visible:outline-2 pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:top-1/2 pointer-coarse:after:h-11 pointer-coarse:after:-translate-y-1/2"
        >
          <option.icon className="size-4" aria-hidden />
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
