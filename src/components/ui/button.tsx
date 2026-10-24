import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full border bg-clip-padding text-sm font-medium whitespace-nowrap transition-[scale,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:active:not-aria-[haspopup]:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:start-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 pointer-coarse:after:-translate-1/2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "surface-solid",
        selected: "surface-selected",
        outline: "surface-control text-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-accent aria-expanded:bg-accent",
        // a see-through fill rather than --accent, which equals --raised in dark mode and so vanished on a
        // field-coloured box inside a card; a tint of the text colour steps off whichever surface is underneath
        ghost:
          "border-transparent text-foreground hover:bg-foreground/6 aria-expanded:bg-foreground/6 dark:hover:bg-foreground/8 dark:aria-expanded:bg-foreground/8",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-destructive",
        link: "border-transparent text-foreground underline-offset-4 hover:underline active:scale-100",
        "destructive-outline":
          "surface-control text-foreground hover:text-destructive",
        "destructive-ghost":
          "border-transparent hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20",
      },
      size: {
        default:
          "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5",
        lg: "h-10 gap-2 px-5 has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xl: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const shared = {
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
  };
  const classes = cn(buttonVariants({ variant, size, className }));

  // Base UI's Button gives whatever it renders role="button", and its docs keep links out of it; a link styled as a
  // button stays a link, as it was under Radix's Slot
  if (
    React.isValidElement<{ href?: unknown }>(props.render) &&
    props.render.props.href !== undefined
  ) {
    return <ButtonLink {...shared} {...props} className={classes} />;
  }

  return <ButtonPrimitive {...shared} {...props} className={classes} />;
}

function ButtonLink({
  render,
  nativeButton: _nativeButton,
  focusableWhenDisabled: _focusableWhenDisabled,
  ...props
}: ButtonPrimitive.Props) {
  return useRender({
    render: render as React.ReactElement,
    props,
  });
}

export { Button, buttonVariants };
