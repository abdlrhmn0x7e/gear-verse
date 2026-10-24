"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/* sideOffset is the gap past the arrow: the arrow's tip pokes out of the bubble, so the bubble keeps this much more
   distance from the trigger (what Radix added from the arrow's measured box) */
const ARROW_CLEARANCE = 10;

function TooltipContent({
  className,
  side = "top",
  sideOffset = 0,
  align = "center",
  alignOffset = 0,
  collisionPadding,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "collisionPadding"
  > & { sideOffset?: number }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset + ARROW_CLEARANCE}
        collisionPadding={collisionPadding}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-foreground text-background data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative isolate z-50 flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs has-data-[slot=kbd]:pe-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-lg",
            className,
          )}
          {...props}
        >
          {children}
          {/* A rotated square serves every side, so only its edge offset changes with the side. It is sunk 3.75px
              into the bubble, so its sides meet a pill's round end along the curve instead of poking out past it
              as a notch, and it sits under the bubble's content (the bubble isolates) so the sunk half never covers
              the label. */}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className="bg-foreground -z-10 size-3 rotate-45 rounded-[2px] data-[side=bottom]:-top-[2.25px] data-[side=inline-end]:-start-[2.25px] data-[side=inline-start]:-end-[2.25px] data-[side=left]:-end-[2.25px] data-[side=right]:-start-[2.25px] data-[side=top]:-bottom-[2.25px]"
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
