"use client";

import { IconCategory, IconFolder, IconShoppingBag } from "@tabler/icons-react";
import { HomeIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { iconsMap } from "~/lib/icons-map";
import { Heading } from "../heading";
import { useEffect } from "react";
import { useDialog } from "~/hooks/use-dialog";

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
        <ul className="grid grid-cols-3">
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
          <li className="flex items-center justify-center">
            <CategoriesDrawer />
          </li>
        </ul>
      </nav>
    </div>
  );
}

function CategoriesDrawer() {
  const trpc = useTRPC();
  const drawer = useDialog();
  const pathname = usePathname();
  const { data: categories, isPending: categoriesPending } = useQuery(
    trpc.public.categories.queries.findRoots.queryOptions(),
  );

  useEffect(() => {
    drawer.dismiss();
  }, [pathname]);

  return (
    <Drawer {...drawer.props}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="min-w-24 flex-col items-center gap-0 py-2"
          size="lg"
        >
          <IconCategory className="size-6" />
          Category
        </Button>
      </DrawerTrigger>
      <DrawerContent className="space-y-4">
        <DrawerTitle className="text-center">Categories</DrawerTitle>
        <DrawerDescription></DrawerDescription>

        <DrawerBody className="grid max-h-[calc(100svh-4rem)] grid-cols-2 gap-3 overflow-y-auto">
          {categoriesPending || !categories
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))
            : categories.map((cat) => {
                const CategoryIcon = iconsMap.get(cat.icon) ?? IconFolder;
                return (
                  <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                    <Card className="ring-accent transition-shadow hover:ring-2">
                      <CardContent className="flex flex-col items-center gap-2 text-center">
                        <CategoryIcon />
                        <Heading level={4}>{cat.name}</Heading>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
