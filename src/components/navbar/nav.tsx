"use client";

import { cn } from "~/lib/utils";
import { NavigationMenu } from "radix-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navTextClassName =
  "text-muted-foreground hover:text-foreground active:text-foreground aria-[current=page]:text-foreground data-[state=open]:text-foreground inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium transition-[color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

function NavTextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <NavigationMenu.Link asChild active={pathname === href}>
      <Link
        href={href}
        aria-current={pathname === href ? "page" : undefined}
        className={navTextClassName}
      >
        {children}
      </Link>
    </NavigationMenu.Link>
  );
}

function NavTextTrigger({ children }: { children: React.ReactNode }) {
  return (
    <NavigationMenu.Trigger className={cn(navTextClassName, "group")}>
      {children}
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

// An open menu turns the bar into the popover surface, so its content is a floating layer: outlined tiles in it take
// the floating hairline.
function NavContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenu.Content>) {
  return (
    <NavigationMenu.Content
      className={cn(
        "surface-floating data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in-0 data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out-0 px-6 pt-2 pb-8 lg:px-8",
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
        "mx-auto h-(--radix-navigation-menu-viewport-height) w-full max-w-7xl overflow-hidden transition-[height] duration-200 ease-out",
        className,
      )}
      {...props}
    />
  );
}

export { NavContent, NavLink, NavTextLink, NavTextTrigger, NavViewport };
