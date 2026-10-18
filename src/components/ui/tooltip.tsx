"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 *:has-data-[slot=tooltip-arrow]:-z-10 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg",
          className,
        )}
        {...props}
      >
        {children}
        {/* Radix turns the arrow's wrapper to face each side, so one shape
            serves all four. The content is block-level flex on purpose: inline,
            it sits on a line box that pushes it a pixel down its wrapper, off
            the line the arrow is aimed along.
            The diamond is sunk 3.75px into the bubble so its sides meet a
            pill's round end along the curve instead of poking out past it as
            a notch, and its wrapper sits under the bubble so the sunk half
            never covers the label. Its negative margin keeps the 10px box
            Radix measures for the offset, so tooltips keep their distance
            from the trigger. */}
        <TooltipPrimitive.Arrow
          data-slot="tooltip-arrow"
          className="bg-foreground fill-foreground -mb-0.5 size-3 translate-y-[calc(-50%_-_3.75px)] rotate-45 rounded-[2px]"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
