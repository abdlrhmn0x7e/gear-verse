"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { MinusIcon } from "lucide-react";

import { cn } from "~/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "group peer border-border bg-background focus-visible:ring-ring data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground relative h-4 w-4 shrink-0 overflow-hidden rounded border shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        "cursor-pointer",
        className,
      )}
      {...props}
    >
      <span className="ring-primary group-data-[state=checked]:bg-primary group-data-[state=indeterminate]:bg-primary group-data-[state=checked]:ring-primary group-data-[state=indeterminate]:ring-primary absolute inset-0 z-0 bg-clip-padding ring-0 transition-shadow duration-100 ease-in-out ring-inset group-data-[state=checked]:ring-8 group-data-[state=indeterminate]:ring-8" />
      <CheckboxPrimitive.Indicator className="relative z-10 flex items-center justify-center text-current">
        <MinusIcon className="hidden h-4 w-4 group-data-[state=indeterminate]:block" />
        <svg
          viewBox="0 0 16 16"
          className="text-primary-foreground hidden group-data-[state=checked]:block"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
        >
          <path
            d="M1.5,5.5L3.44655,8.22517C3.72862,8.62007,4.30578,8.64717,4.62362,8.28044L10.5,1.5"
            transform="translate(2 2.980376)"
            className="group-data-[state=checked]:animate-checkbox-path transition-[stroke-dasharray]"
            opacity="100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
          ></path>
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
