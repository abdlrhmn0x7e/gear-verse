"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "~/components/ui/sidebar";
import { NavMain } from "./nav-main";
import {
  BadgeDollarSignIcon,
  FoldersIcon,
  HomeIcon,
  PackageIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { KbdGroup } from "~/components/ui/kbd";
import {
  ProductSearchDialog,
  ProductSearchIcon,
  ProductSearchPlaceholder,
} from "../../../components/product-search-dialog";
import { Kbd } from "~/components/ui/kbd";

const DASHBOARD_ITEMS = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: HomeIcon,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: PackageIcon,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: FoldersIcon,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: BadgeDollarSignIcon,
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          asChild
        >
          <Link href="/">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
              <SparklesIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Gear Verse</span>
              <span className="truncate text-xs">Admin</span>
            </div>
          </Link>
        </SidebarMenuButton>

        <ProductSearchDialog dialogClassName="inset-x-0">
          <SidebarMenuButton className="group relative z-10 w-full cursor-text border-none hover:bg-transparent">
            <ProductSearchIcon />
            <ProductSearchPlaceholder>Search Products</ProductSearchPlaceholder>

            <KbdGroup className="absolute top-1/2 right-3 z-10 -translate-y-1/2 pt-1 group-data-[sidebar-open=false]:hidden">
              <Kbd>⌘ + K</Kbd>
            </KbdGroup>
          </SidebarMenuButton>
        </ProductSearchDialog>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={DASHBOARD_ITEMS} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
