"use client";

import { IconFolder } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useDialog } from "~/hooks/use-dialog";
import { iconsMap } from "~/lib/icons-map";
import { useTRPC } from "~/trpc/client";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import { SOCIAL_LINKS } from "./social-links";

const PRIMARY_LINKS = [
  { title: "Home", href: "/" },
  { title: "Store", href: "/products" },
  { title: "FAQ", href: "/#faq" },
  { title: "My orders", href: "/orders" },
];

export function MobileNav() {
  const trpc = useTRPC();
  const sheet = useDialog();
  const { data: categories, isPending } = useQuery(
    trpc.public.categories.queries.findRoots.queryOptions(),
  );

  return (
    <Sheet {...sheet.props}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="md:hidden">
          <MenuIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="gap-0 overflow-y-auto">
        <SheetHeader className="px-6 pt-5 pb-2">
          <SheetTitle asChild>
            <Link href="/" onNavigate={sheet.dismiss} className="w-fit">
              <Logo className="h-9" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-10 px-6 py-6">
          <ul className="flex flex-col">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onNavigate={sheet.dismiss}
                  className="text-title block rounded-md py-2 outline-none focus-visible:outline-2 focus-visible:outline-focus"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Categories</p>
            <ul className="grid grid-cols-2 gap-2">
              {isPending || !categories
                ? Array.from({ length: 4 }).map((_, index) => (
                    <li key={index}>
                      <Skeleton className="h-20 rounded-2xl" />
                    </li>
                  ))
                : categories.map((category) => {
                    const Icon = iconsMap.get(category.icon) ?? IconFolder;
                    return (
                      <li key={category.slug}>
                        <Link
                          href={`/categories/${category.slug}`}
                          onNavigate={sheet.dismiss}
                          className="bg-card active:bg-accent flex flex-col gap-4 rounded-2xl p-4 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-focus"
                        >
                          <Icon className="size-5" stroke={1.75} aria-hidden />
                          {category.name}
                        </Link>
                      </li>
                    );
                  })}
            </ul>
          </div>

          <ul className="flex gap-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.url}>
                <Button variant="outline" size="icon-lg" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <link.icon stroke={1.75} />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
