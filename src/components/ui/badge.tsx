import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 rounded-sm border border-transparent font-medium whitespace-nowrap transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3 [button,a&]:cursor-pointer [button,a&]:pointer-coarse:after:absolute [button,a&]:pointer-coarse:after:size-full [button,a&]:pointer-coarse:after:min-h-11 [button,a&]:pointer-coarse:after:min-w-11",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [button,a&]:hover:bg-primary/90",
        destructive:
          "bg-destructive text-white [button,a&]:hover:bg-destructive/90",
        outline:
          "bg-background border-border [button,a&]:hover:bg-accent/50 dark:[button,a&]:hover:bg-input/48",
        secondary:
          "bg-secondary text-secondary-foreground [button,a&]:hover:bg-secondary/90",
        info: "bg-info/8 text-info-foreground dark:bg-info/16",
        success:
          "bg-green-300 dark:bg-green-900 dark:text-green-300 text-green-800 [a&]:hover:bg-green-600",
        warning:
          "dark:border-yellow-800 border-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 text-yellow-600 [a&]:hover:bg-yellow-600",
        error:
          "bg-red-200 dark:bg-red-900 dark:text-red-300 text-red-600 [a&]:hover:bg-red-600",
      },
      size: {
        default: "px-[calc(--spacing(1)-1px)] text-xs",
        sm: "rounded-[calc(var(--radius-sm)-2px)] px-[calc(--spacing(1)-1px)] text-[.625rem]",
        lg: "px-[calc(--spacing(1.5)-1px)] text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
