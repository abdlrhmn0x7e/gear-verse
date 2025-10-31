"use client";

import { IconShoppingBag } from "@tabler/icons-react";
import { HomeIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    title: "Home",
    link: {
      href: "/",
    },
    order: 1,
    icon: HomeIcon,
  },
  {
    title: "Products",
    link: {
      href: "/products",
    },
    order: 3,
    icon: IconShoppingBag,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <nav className="bg-card/95 border-t p-2 backdrop-blur">
        <ul className="grid grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.title} className="flex items-center justify-center">
              <Button
                variant="ghost"
                className={cn(
                  "min-w-24 flex-col items-center gap-0 py-2",
                  pathname === item.link.href &&
                    "text-primary dark:text-accent-foreground",
                )}
                size="lg"
                asChild
              >
                <Link href={item.link.href} key={item.title}>
                  <item.icon className="size-6" />
                  {item.title}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
