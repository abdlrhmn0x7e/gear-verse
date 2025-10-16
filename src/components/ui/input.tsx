import * as React from "react";

import { cn } from "~/lib/utils/index";

function Input({
  className,
  size,
  type,
  ...props
}: React.ComponentProps<"input"> & { size?: "sm" | "lg" }) {
  return (
    <span
      data-slot="input-control"
      className={cn(
        "border-input bg-background ring-ring/24 has-focus-visible:border-ring has-aria-invalid:border-destructive/36 has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 dark:bg-input/32 dark:has-aria-invalid:ring-destructive/24 relative inline-flex w-full rounded-lg border bg-clip-padding text-base/5 transition-[color,background-color,box-shadow,border-color] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:before:shadow-sm has-focus-visible:ring-[3px] has-disabled:opacity-64 has-aria-invalid:before:shadow-none sm:text-sm dark:bg-clip-border dark:shadow-black/24 dark:not-has-disabled:shadow-sm dark:not-has-disabled:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)]",

        className,
      )}
    >
      <PrimitiveInput
        className={className}
        size={size}
        type={type}
        {...props}
      />
    </span>
  );
}

export function PrimitiveInput({
  className,
  size,
  type,
  ...props
}: React.ComponentProps<"input"> & { size?: "sm" | "lg" }) {
  return (
    <input
      className={cn(
        "placeholder:text-muted-foreground/64 w-full min-w-0 rounded-[inherit] px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] outline-none",
        size === "sm" &&
          "px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)]",
        size === "lg" && "py-[calc(--spacing(2)-1px)]",
        type === "search" &&
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
        type === "file" &&
          "text-muted-foreground file:text-foreground file:me-3 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      size={typeof size === "number" ? size : undefined}
      type={type}
      {...props}
    />
  );
}

export { Input };
