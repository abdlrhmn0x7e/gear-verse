"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Kbd, KbdGroup } from "~/components/ui/kbd";
import { cn } from "~/lib/utils";

export function SearchInput({
  className,
  children,
  ...props
}: React.ComponentProps<"input"> & {
  children?: React.ReactNode;
  size?: "sm" | "lg";
}) {
  const searchRef = useRef<HTMLInputElement>(null);

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
    <InputGroup className={cn("h-9", className)}>
      <InputGroupInput
        placeholder="Search..."
        ref={searchRef}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon size={16} />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <KbdGroup>
          <Kbd className="text-muted-foreground text-sm">/</Kbd>
        </KbdGroup>
        <div>{children}</div>
      </InputGroupAddon>
    </InputGroup>
  );
}
