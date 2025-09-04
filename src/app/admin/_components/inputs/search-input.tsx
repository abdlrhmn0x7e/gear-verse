"use client";

import { SearchIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { debounce, parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";

export function SearchInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useQueryState(
    "title",
    parseAsString.withOptions({
      shallow: true,
    }),
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        e.stopPropagation();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div
      className={cn(
        "from-primary/40 ring-primary to-accent rounded-lg bg-gradient-to-br p-px transition-shadow has-focus:ring-2",
        className,
      )}
    >
      <div
        className={cn(
          "bg-background flex items-center gap-3 rounded-[calc(var(--radius)-1px)] px-2 py-1",
          className,
        )}
      >
        <SearchIcon size={16} />

        <input
          ref={searchRef}
          placeholder="Search"
          className="ring-input flex-1 focus-visible:outline-none"
          value={title ?? ""}
          onChange={(e) =>
            setTitle(e.target.value, {
              limitUrlUpdates:
                e.target.value === "" ? undefined : debounce(500),
            })
          }
          {...props}
        />
        <div className="from-primary/30 to-primary/5 bordermd flex size-6 items-center justify-center rounded-[calc(var(--radius)-1px)] bg-radial">
          <kbd className="text-muted-foreground text-sm">/</kbd>
        </div>
      </div>
    </div>
  );
}
