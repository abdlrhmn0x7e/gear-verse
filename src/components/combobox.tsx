import * as ComboboxPrimitive from "@diceui/combobox";
import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "lucide-react";
import type * as React from "react";

import { cn } from "~/lib/utils";
import { badgeVariants } from "./ui/badge";

const Combobox = (({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Root>) => {
  return (
    <span
      data-slot="input-control"
      className={cn(
        "surface-control surface-field has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40 relative inline-flex min-h-9 w-full rounded-[18px] text-base transition-[color,background-color,border-color,box-shadow] has-disabled:opacity-50 has-aria-invalid:ring-3 md:text-sm",
        className,
      )}
    >
      <ComboboxPrimitive.Root
        data-slot="combobox"
        className={className}
        {...props}
      />
    </span>
  );
}) as ComboboxPrimitive.ComboboxRootComponentProps;

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Label>) {
  return (
    <ComboboxPrimitive.Label
      data-slot="combobox-label"
      className={cn("px-0.5 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
}

function ComboboxAnchor({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Anchor>) {
  return (
    <ComboboxPrimitive.Anchor
      data-slot="combobox-anchor"
      className={cn(
        "relative flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-[inherit] py-1 pr-10 pl-4 has-data-[slot=combobox-badge-item]:pl-1.5",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "placeholder:text-muted-foreground min-w-20 flex-1 bg-transparent py-1 outline-none disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "text-muted-foreground hover:text-foreground absolute top-2.5 right-4 flex shrink-0 items-center justify-center transition-colors focus-visible:outline-hidden disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          strokeWidth={2}
          className="pointer-events-none size-4"
        />
      )}
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxCancel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Cancel>) {
  return (
    <ComboboxPrimitive.Cancel
      data-slot="combobox-cancel"
      className={cn(
        "bg-background ring-offset-background focus:ring-ring absolute top-1/2 right-1 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxBadgeList({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.BadgeList>) {
  return (
    <ComboboxPrimitive.BadgeList
      data-slot="combobox-badge-list"
      className={cn("flex flex-wrap items-center", className)}
      {...props}
    />
  );
}

function ComboboxBadgeItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.BadgeItem>) {
  return (
    <ComboboxPrimitive.BadgeItem
      data-slot="combobox-badge-item"
      className={cn(
        badgeVariants({
          variant: "outline",
          className,
        }),
        "px-2",
      )}
      {...props}
    >
      <span className="text-secondary-foreground truncate text-[13px]">
        {children}
      </span>
      <ComboboxPrimitive.BadgeItemDelete
        data-slot="combobox-badge-item-delete"
        className="ring-offset-background focus-visible:ring-ring data-highlighted:bg-destructive shrink-0 cursor-pointer rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:outline-hidden"
      >
        <X className="size-3" />
      </ComboboxPrimitive.BadgeItemDelete>
    </ComboboxPrimitive.BadgeItem>
  );
}

function ComboboxContent({
  sideOffset = 6,
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Content>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Content
        data-slot="combobox-content"
        sideOffset={sideOffset}
        className={cn(
          "surface-control surface-floating text-popover-foreground data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=open]:animate-in no-scrollbar scroll-fade relative z-50 max-h-[min(--spacing(72),var(--dice-available-height))] w-(--dice-anchor-width) origin-(--dice-transform-origin) overflow-y-auto rounded-[20px] p-1.5 duration-100 [--surface-shadow:var(--shadow-lg)]",
          className,
        )}
        {...props}
      >
        {children}
      </ComboboxPrimitive.Content>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxLoading({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Loading>) {
  return (
    <ComboboxPrimitive.Loading
      data-slot="combobox-loading"
      className={cn(
        "text-muted-foreground py-6 text-center text-sm",
        className,
      )}
      {...props}
    >
      Loading...
    </ComboboxPrimitive.Loading>
  );
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground py-6 text-center text-sm",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Group>) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

function ComboboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.GroupLabel>) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn(
        "text-muted-foreground px-3 py-2 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center gap-2.5 rounded-[14px] py-2 pr-8 pl-3 text-sm font-medium outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
      </ComboboxPrimitive.ItemIndicator>
      <ComboboxPrimitive.ItemText>{children}</ComboboxPrimitive.ItemText>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Separator>) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("bg-border -mx-1.5 my-1.5 h-px", className)}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxCancel,
  ComboboxBadgeList,
  ComboboxBadgeItem,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxLabel,
  ComboboxLoading,
  ComboboxSeparator,
};
