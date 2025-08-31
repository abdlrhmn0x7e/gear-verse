"use client";

import { Logo } from "./logo";
import { Button } from "./ui/button";
import { DoorOpenIcon, HomeIcon, Menu, type LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { ProfileDropdown } from "./profile-dropdown";

export interface NavigationLink {
  title: string;
  icon: LucideIcon;
  link: ComponentProps<typeof Link>;
}

const NAV_ITEMS = [
  {
    title: "Home",
    link: {
      href: "/",
    },
    icon: HomeIcon,
  },
] as const satisfies ReadonlyArray<NavigationLink>;

export function Navbar() {
  const { data } = authClient.useSession();

  return (
    <header className="fixed top-5 left-1/2 z-50 container -translate-x-1/2">
      <div className="bg-card/40 rounded-full border px-8 py-2 backdrop-blur">
        <nav className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-12">
            <Link href="/">
              <Logo />
            </Link>

            {/* Nav Items */}
            <div className="hidden w-full items-center gap-2 lg:flex">
              <p>Products</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            {data ? (
              <ProfileDropdown />
            ) : (
              <Button asChild>
                <Link href="/auth">
                  <DoorOpenIcon />
                  Login
                </Link>
              </Button>
            )}

            <MobileMenu>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu />
              </Button>
            </MobileMenu>
          </div>
        </nav>
      </div>
    </header>
  );
}

function MobileMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Navigation</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.title}
              variant={pathname === item.link.href ? "default" : "ghost"}
              size="lg"
              className="justify-start"
              asChild
            >
              <Link {...item.link}>
                <item.icon />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
