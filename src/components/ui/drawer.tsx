"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "~/lib/utils";
import { isToastInteraction } from "~/components/ui/toast";

/** Set inside a drawer's popup, so a drawer opened from it stacks on its parent and leaves the dimming to it */
const NestedDrawerContext = React.createContext(false);

function Drawer({
  swipeDirection = "down",
  onOpenChange,
  ...props
}: DrawerPrimitive.Root.Props) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      swipeDirection={swipeDirection}
      onOpenChange={(open, details) => {
        // closing a toast that sits over the drawer shouldn't close the drawer
        if (
          details.reason === "outside-press" &&
          isToastInteraction(details.event)
        ) {
          details.cancel();
          return;
        }
        onOpenChange?.(open, details);
      }}
      {...props}
    />
  );
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 min-h-dvh bg-black/30 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      {...props}
    />
  );
}

function subscribeToVisualViewport(onChange: () => void) {
  window.visualViewport?.addEventListener("resize", onChange);
  window.visualViewport?.addEventListener("scroll", onChange);
  return () => {
    window.visualViewport?.removeEventListener("resize", onChange);
    window.visualViewport?.removeEventListener("scroll", onChange);
  };
}

/** The visible height above the keyboard; the drawer's bottom is lifted to the keyboard's top, assuming iOS has not
 * panned the page, and when it has, the panned-away strip at the top is out of reach too. */
function getVisibleHeight() {
  const viewport = window.visualViewport;
  return viewport ? viewport.height - viewport.offsetTop : undefined;
}

function DrawerContent({
  className,
  children,
  style,
  initialFocus,
  finalFocus,
  ...props
}: DrawerPrimitive.Popup.Props) {
  const nested = React.useContext(NestedDrawerContext);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const returnFocusTo = React.useRef<HTMLElement | null>(null);
  // iOS lays the keyboard over the page and shrinks only the visual viewport, so vh, svh and dvh all stay put while
  // the drawer is lifted above the keyboard; capping the drawer at the visual viewport keeps its top on screen
  const visibleHeight = React.useSyncExternalStore(
    subscribeToVisualViewport,
    getVisibleHeight,
    () => undefined,
  );

  return (
    <DrawerPrimitive.VirtualKeyboardProvider>
      <DrawerPortal>
        {!nested && <DrawerOverlay />}
        <DrawerPrimitive.Viewport
          data-slot="drawer-viewport"
          className="fixed inset-0 z-50 select-none"
        >
          <DrawerPrimitive.Popup
            ref={popupRef}
            data-slot="drawer-content"
            style={(state) => ({
              "--drawer-visible-height": visibleHeight
                ? `${visibleHeight}px`
                : undefined,
              ...(typeof style === "function" ? style(state) : style),
            })}
            // The default focuses the first button on open and the trigger on close. A tap on iOS focuses nothing, and
            // WebKit shows the focus ring for any focus a script moves unless the last focus came from a click, so
            // every drawer opened by touch drew the ring on its first button. The panel takes focus instead (Tab
            // reaches its controls), and on close focus only goes back where it was, which after a tap is nowhere
            initialFocus={(openType) => {
              const active = document.activeElement;
              returnFocusTo.current =
                active instanceof HTMLElement && active !== document.body
                  ? active
                  : null;
              if (initialFocus === undefined) return popupRef.current;
              if (typeof initialFocus === "function") {
                return initialFocus(openType);
              }
              return typeof initialFocus === "boolean"
                ? initialFocus
                : initialFocus.current;
            }}
            finalFocus={(closeType) => {
              const target = returnFocusTo.current;
              returnFocusTo.current = null;
              if (finalFocus !== undefined) {
                if (typeof finalFocus === "function") {
                  return finalFocus(closeType);
                }
                return typeof finalFocus === "boolean"
                  ? finalFocus
                  : finalFocus.current;
              }
              return target?.isConnected ? target : false;
            }}
            className={cn(
              "group/drawer-content surface-floating before:bg-popover fixed z-50 flex h-auto flex-col bg-transparent p-4 text-sm outline-none select-none before:absolute before:inset-2 before:-z-10 before:rounded-[28px] before:border before:border-(--floating-border) before:bg-clip-padding before:shadow-2xl",
              // Motion: the open, close and swipe offsets and the stack a nested drawer pushes this one back into
              "transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] transition-[transform,height,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [interpolate-size:allow-keywords] data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-nested-drawer-swiping:duration-0 data-starting-style:transform-(--closed-transform) data-swiping:duration-0 data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength,1)*400ms)]",
              "[--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers,0)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress,0),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers,0)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05] data-nested-drawer-open:brightness-95",
              // Bottom: lifted over the software keyboard and capped to what is visible above it
              "data-[swipe-direction=down]:right-[env(safe-area-inset-right)] data-[swipe-direction=down]:bottom-(--drawer-keyboard-inset,0px) data-[swipe-direction=down]:left-[env(safe-area-inset-left)] data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[min(80svh,calc(var(--drawer-visible-height,100svh)-1.5rem))] data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))] data-[swipe-direction=down]:data-nested-drawer-open:h-(--stack-height) data-[swipe-direction=down]:data-nested-drawer-open:overflow-hidden",
              "data-[swipe-direction=up]:top-[env(safe-area-inset-top)] data-[swipe-direction=up]:right-[env(safe-area-inset-right)] data-[swipe-direction=up]:left-[env(safe-area-inset-left)] data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[min(80svh,calc(var(--drawer-visible-height,100svh)-1.5rem))] data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
              "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-[env(safe-area-inset-left)] data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x,0px)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))] data-[swipe-direction=left]:sm:max-w-md",
              "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-[env(safe-area-inset-right)] data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x,0px)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))] data-[swipe-direction=right]:sm:max-w-md",
              className,
            )}
            {...props}
          >
            <div className="bg-foreground/15 mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full transition-opacity duration-200 group-data-nested-drawer-open/drawer-content:opacity-0 group-data-[swipe-direction=down]/drawer-content:block" />
            {/* A mouse drag here selects text rather than swiping the drawer; touch still swipes from anywhere */}
            <DrawerPrimitive.Content
              data-slot="drawer-inner"
              className="flex min-h-0 flex-1 flex-col transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-content:opacity-0 group-data-nested-drawer-swiping/drawer-content:opacity-100 group-data-swiping/drawer-content:select-none"
            >
              <NestedDrawerContext.Provider value={true}>
                {children}
              </NestedDrawerContext.Provider>
            </DrawerPrimitive.Content>
            {/* Tops the content's bottom padding (1rem or more) up to the home indicator's inset; a spacer rather than
                pb-[max(...)], which would override the padding each drawer sets */}
            <div
              aria-hidden
              className="h-[max(0px,calc(env(safe-area-inset-bottom)-1rem))] shrink-0 group-data-[swipe-direction=up]/drawer-content:hidden"
            />
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPortal>
    </DrawerPrimitive.VirtualKeyboardProvider>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center md:gap-1.5 md:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(
        "scroll-fade min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "font-heading text-foreground text-base font-medium",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
