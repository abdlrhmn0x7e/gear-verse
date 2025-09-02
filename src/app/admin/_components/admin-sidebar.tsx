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
import { HomeIcon, PackageIcon, SearchIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { Button } from "~/components/ui/button";
import { CommandShortcut } from "~/components/ui/command";

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
        <Button variant="outline" className="w-full justify-start">
          <SearchIcon className="size-4" />
          Search Products...
          <CommandShortcut>⌘K</CommandShortcut>
        </Button>
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
