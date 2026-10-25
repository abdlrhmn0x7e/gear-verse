"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { navTextClassName } from "./nav-text";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { Link, usePathname } from "~/i18n/navigation";

function NavTextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <NavigationMenu.Link
      active={pathname === href}
      aria-current={pathname === href ? "page" : undefined}
      className={navTextClassName}
      render={<Link href={href} />}
    >
      {children}
    </NavigationMenu.Link>
  );
}

function NavTextTrigger({ children }: { children: React.ReactNode }) {
  return (
    <NavigationMenu.Trigger
      data-slot="nav-trigger"
      className={cn(navTextClassName, "group")}
    >
      {children}
    </NavigationMenu.Trigger>
  );
}

// Base UI keeps the menu open on a link press by default; a client-side navigation wouldn't otherwise close it.
function NavLink({ children, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <NavigationMenu.Link closeOnClick render={<Link {...props} />}>
      {children}
    </NavigationMenu.Link>
  );
}

// An open menu turns the bar into the popover surface, so its content is a floating layer: outlined tiles in it take
// the floating hairline. Switching between menus fades the outgoing content out and the incoming one in; the first
// open shows at once, as the bar's own tint carries it.
function NavContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenu.Content>) {
  return (
    <NavigationMenu.Content
      className={cn(
        "surface-floating px-6 pt-2 pb-8 data-activation-direction:transition-opacity data-activation-direction:duration-150 data-activation-direction:data-ending-style:opacity-0 data-activation-direction:data-starting-style:opacity-0 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

// The open menu sits in the bar's flow and grows it, so the bar's own tint and fade cover it. Base UI only closes a
// top-level menu (on hover-out, Escape, an outside press, a second click) through its positioner, so the menu keeps
// one, portalled into the header and pinned back into the flow over the inline position it computes.
function NavViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenu.Viewport>) {
  const slotRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={slotRef} />
      <NavigationMenu.Portal container={slotRef}>
        <NavigationMenu.Positioner className="!static w-full ![transform:none]">
          <NavigationMenu.Popup className="outline-none">
            <NavigationMenu.Viewport
              className={cn(
                "relative mx-auto w-full max-w-7xl overflow-hidden",
                className,
              )}
              {...props}
            />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </>
  );
}

export { NavContent, NavLink, NavTextLink, NavTextTrigger, NavViewport };
