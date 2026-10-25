"use client";

import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

/** The "Any" choice; a radio value can't be null. */
const ANY = "";

/**
 * A one-of filter as the reference's segmented pill, "Label | Value ⌄": the
 * label quiet, the current value in full weight, and a menu of the values
 * with "Any" first to clear it.
 */
export function FilterPill<T extends string>({
  label,
  value,
  options,
  onChange,
  anyLabel = "Any",
}: {
  label: string;
  value: T | null;
  options: readonly { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T | null) => void;
  anyLabel?: string;
}) {
  const current = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="surface-control group/pill inline-flex h-[30px] shrink-0 items-stretch rounded-full text-xs whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="text-muted-foreground flex items-center px-[9px]">
          {label}
        </span>
        <span aria-hidden className="w-px bg-white/8" />
        <span className="flex items-center gap-1.5 ps-[9px] pe-2 font-medium">
          {current?.label ?? anyLabel}
          <ChevronDownIcon
            aria-hidden
            className="text-muted-foreground size-3.5 group-aria-expanded/pill:rotate-180"
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value ?? ANY}
            onValueChange={(next: string) =>
              onChange(
                options.find((option) => option.value === next)?.value ?? null,
              )
            }
          >
            <DropdownMenuRadioItem value={ANY} closeOnClick>
              {anyLabel}
            </DropdownMenuRadioItem>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                closeOnClick
              >
                {option.icon}
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
