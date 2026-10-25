"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "~/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { fieldTriggerClassName } from "~/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SearchIcon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-[inherit]",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-[20px]! p-0",
          className,
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

/* The field that opens a command menu, drawn exactly like a select trigger so it takes the same fill, border and
   focus ring on the page and inside a card */
function CommandTrigger({
  className,
  children,
  size = "default",
  type = "button",
  // The loading and error placeholders never open, so they report a closed popup.
  "aria-expanded": ariaExpanded = false,
  "aria-controls": ariaControls,
  ...props
}: React.ComponentProps<"button"> & { size?: "sm" | "default" }) {
  return (
    <button
      type={type}
      role="combobox"
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      data-slot="command-trigger"
      data-size={size}
      className={cn(fieldTriggerClassName, "w-full min-w-0", className)}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-start">
        {children}
      </span>
      <HugeiconsIcon
        icon={UnfoldMoreIcon}
        strokeWidth={2}
        className="text-muted-foreground pointer-events-none size-4"
      />
    </button>
  );
}

/* The search is the menu's header row rather than a field inside it, like the storefront search: the trigger opens
   into it, so it has no box or focus ring of its own, only the hairline under it */
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-11 shrink-0 items-center gap-2.5 border-b px-4.5"
    >
      <HugeiconsIcon
        icon={SearchIcon}
        strokeWidth={2}
        className="text-muted-foreground size-4 shrink-0"
      />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground h-full w-full min-w-0 bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar scroll-fade max-h-72 scroll-py-1.5 overflow-x-hidden overflow-y-auto outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "text-muted-foreground py-6 text-center text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1.5 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border my-1.5 h-px", className)}
      {...props}
    />
  );
}

/* Rows match select and dropdown-menu items. Pass data-checked for the selected row; its tick takes the trailing
   column the way a select's does, so anything else in the row (a delete button) lines up just before it */
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item data-selected:bg-accent data-selected:text-accent-foreground relative flex cursor-default items-center gap-2.5 rounded-[14px] py-2 pe-8 ps-3 text-sm font-medium outline-hidden select-none has-data-[slot=command-shortcut]:pe-3 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute end-2 flex size-4 items-center justify-center group-has-data-[slot=command-shortcut]/command-item:hidden">
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={2}
          className="opacity-0 group-data-[checked=true]/command-item:opacity-100"
        />
      </span>
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground group-data-selected/command-item:text-foreground ms-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

/* An action under the list, such as "Add brand", laid out as one more menu row behind the same hairline */
function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "border-t p-1.5 *:data-[slot=button]:w-full *:data-[slot=button]:justify-start *:data-[slot=button]:rounded-[14px] *:data-[slot=button]:px-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandTrigger,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandFooter,
};
