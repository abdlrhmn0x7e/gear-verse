"use client";

import { cn } from "~/lib/utils";
import { NavigationMenu } from "radix-ui";
import { Button } from "../ui/button";
import Link from "next/link";

function NavTrigger({
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenu.Trigger>) {
  return (
    <NavigationMenu.Trigger
      autoFocus={false}
      onMouseMoveCapture={(e) => e.preventDefault()}
      asChild
      {...props}
    >
      <Button
        variant="ghost"
        className="data-[state=open]:border-border"
        size="lg"
      >
        {children}
      </Button>
    </NavigationMenu.Trigger>
  );
}

function NavLink(props: React.ComponentProps<typeof Link>) {
  return (
    <NavigationMenu.Link asChild>
      <Link {...props} />
    </NavigationMenu.Link>
  );
}

function NavContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenu.Content>) {
  return (
    <NavigationMenu.Content
      className={cn(
        "data-[motion=from-start]:animate-navigation-enter-from-left",
        "data-[motion=from-end]:animate-navigation-enter-from-right",
        "data-[motion=to-start]:animate-navigation-enter-to-left",
        "data-[motion=to-start]:animate-navigation-enter-to-right",
        "min-h-[34svh] px-1",
        className,
      )}
      {...props}
    />
  );
}

function NavViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenu.NavigationMenuViewport>) {
  return (
    <NavigationMenu.NavigationMenuViewport
      className={cn(
        "data-[state=open]:animate-navigation-menu-in",
        "data-[state=closed]:animate-navigation-menu-out",
        "origin-top-center h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden transition-[height] duration-300 ease-in-out",
        className,
      )}
      {...props}
    />
  );
}

export { NavContent, NavLink, NavViewport, NavTrigger };
