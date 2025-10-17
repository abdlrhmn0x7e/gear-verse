import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
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

function NumberInput({
  className,
  step = 1,
  value,
  onChange,
  onFocus,
  ...props
}: React.ComponentProps<typeof Input> & { step?: number }) {
  const [steppedValue, setSteppedValue] = React.useState<number | undefined>(
    Number(value),
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    e.preventDefault();
    setSteppedValue(Number(e.target.value));
    onChange?.(e);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.stopPropagation();
    e.target.select();
    onFocus?.(e);
  }

  function handleIncrement(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setSteppedValue((prev) => (prev ? prev + step : step));
  }

  function handleDecrement(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setSteppedValue((prev) => (prev ? prev - step : 0));
  }

  return (
    <div
      data-slot="input-control"
      className={cn(
        "group border-input bg-background ring-ring/24 has-focus-visible:border-ring has-aria-invalid:border-destructive/36 has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 dark:bg-input/32 dark:has-aria-invalid:ring-destructive/24 relative inline-flex w-full rounded-lg border bg-clip-padding pr-3 text-base/5 transition-[color,background-color,box-shadow,border-color] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:before:shadow-sm has-focus-visible:ring-[3px] has-disabled:opacity-64 has-aria-invalid:before:shadow-none sm:text-sm dark:bg-clip-border dark:shadow-black/24 dark:not-has-disabled:shadow-sm dark:not-has-disabled:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)]",
        className,
      )}
    >
      <PrimitiveInput
        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        type="number"
        onFocus={handleFocus}
        value={steppedValue === 0 ? "" : steppedValue}
        onChange={handleChange}
        {...props}
      />

      <div className="absolute top-1 right-2 bottom-1 flex flex-col gap-0.5 overflow-hidden rounded-[3px] opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="bg-muted text-muted-foreground hover:bg-accent flex h-full w-5 cursor-pointer items-center justify-center transition-colors outline-none [&_svg]:size-2.5"
          onClick={handleIncrement}
        >
          <ChevronUpIcon />
        </button>

        <button
          type="button"
          className="bg-muted text-muted-foreground hover:bg-accent flex h-full w-5 cursor-pointer items-center justify-center transition-colors outline-none [&_svg]:size-2.5"
          onClick={handleDecrement}
        >
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
}

export { Input, NumberInput };
