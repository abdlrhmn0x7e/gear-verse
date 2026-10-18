"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Drawer as DrawerPrimitive } from "vaul";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  // vaul leaves focus on the trigger unless asked, so keyboard and screen
  // reader users would land behind the open drawer
  return <DrawerPrimitive.Root data-slot="drawer" autoFocus {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm",
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

/** The visible height above the keyboard; vaul pins the drawer's bottom to the keyboard's top, assuming iOS has not
 * panned the page, and when it has, the panned-away strip at the top is out of reach too. */
function getVisibleHeight() {
  const viewport = window.visualViewport;
  return viewport ? viewport.height - viewport.offsetTop : undefined;
}

function DrawerContent({
  className,
  children,
  style,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const returnFocusTo = React.useRef<HTMLElement | null>(null);
  // iOS lays the keyboard over the page and shrinks only the visual viewport, so vh, svh and dvh all stay put while
  // vaul lifts the drawer above the keyboard; capping the drawer at the visual viewport keeps its top on screen
  const visibleHeight = React.useSyncExternalStore(
    subscribeToVisualViewport,
    getVisibleHeight,
    () => undefined,
  );

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        style={
          {
            "--drawer-visible-height": visibleHeight
              ? `${visibleHeight}px`
              : undefined,
            ...style,
          } as React.CSSProperties
        }
        // Radix focuses the first button on open and the trigger on close. A tap on iOS focuses nothing, and WebKit
        // shows the focus ring for any focus a script moves unless the last focus came from a click, so every drawer
        // opened by touch drew the ring on its first button. The panel takes focus instead (Tab reaches its controls),
        // and on close focus only goes back where it was, which after a tap is nowhere
        onOpenAutoFocus={(event) => {
          const active = document.activeElement;
          returnFocusTo.current =
            active instanceof HTMLElement && active !== document.body
              ? active
              : null;
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          if (returnFocusTo.current?.isConnected) {
            returnFocusTo.current.focus({ preventScroll: true });
          }
          returnFocusTo.current = null;
        }}
        className={cn(
          "group/drawer-content surface-floating before:bg-popover fixed z-50 flex h-auto flex-col bg-transparent p-4 text-sm outline-none before:absolute before:inset-2 before:-z-10 before:rounded-[28px] before:border before:border-(--floating-border) before:bg-clip-padding before:shadow-2xl data-[vaul-drawer-direction=bottom]:right-[env(safe-area-inset-right)] data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:left-[env(safe-area-inset-left)] data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[min(80svh,calc(var(--drawer-visible-height,100svh)-1.5rem))] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-[env(safe-area-inset-left)] data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-[env(safe-area-inset-right)] data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:top-[env(safe-area-inset-top)] data-[vaul-drawer-direction=top]:right-[env(safe-area-inset-right)] data-[vaul-drawer-direction=top]:left-[env(safe-area-inset-left)] data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[min(80svh,calc(var(--drawer-visible-height,100svh)-1.5rem))] data-[vaul-drawer-direction=left]:sm:max-w-md data-[vaul-drawer-direction=right]:sm:max-w-md",
          className,
        )}
        {...props}
      >
        <div className="bg-foreground/15 mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
        {/* Tops the content's bottom padding (1rem or more) up to the home indicator's inset; a spacer rather than
            pb-[max(...)], which would override the padding each drawer sets */}
        <div
          aria-hidden
          className="h-[max(0px,calc(env(safe-area-inset-bottom)-1rem))] shrink-0 group-data-[vaul-drawer-direction=top]/drawer-content:hidden"
        />
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
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

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
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
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
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
