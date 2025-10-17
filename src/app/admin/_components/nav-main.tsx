"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import type { AdminSidebarItem, AdminSidebarItemItem } from "./admin-sidebar";

export function NavMain({ data }: { data: AdminSidebarItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase">Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {data.map((item) => (
          <NavMainItem key={item.title} data={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavMainItem({ data }: { data: AdminSidebarItem }) {
  const pathname = normlaizePathname(usePathname());
  const isRootLink = data.url === "/admin";
  const isActive =
    (isRootLink ? pathname === "/admin" : pathname.startsWith(data.url)) ||
    (data.items?.some((item) => pathname.startsWith(item.url)) ?? false);
  const activeIndex = data.items?.findIndex((item) => item.url === pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={data.title}
        asChild
        className={cn(
          "border border-transparent",
          isActive &&
            "border-border from-sidebar-accent bg-gradient-to-t to-transparent",
        )}
      >
        <Link href={data.url} className="relative">
          {data.icon && (isActive ? <data.icon /> : <data.iconFilled />)}
          <span>{data.title}</span>
        </Link>
      </SidebarMenuButton>

      {activeIndex !== -1 && data.items && data.items.length > 0 && (
        <div className="bg-primary absolute top-8 left-4 h-2 w-0.5" />
      )}

      {isActive && data.items && data.items.length > 0 && (
        <SidebarMenuSub>
          {data.items.map((item, index) => (
            <NavMainItemSub
              key={item.title}
              data={item}
              showVerticalBorder={
                index >= 0 &&
                index !== (data.items?.length ?? 0) - 1 &&
                activeIndex !== index &&
                activeIndex !== 0 &&
                activeIndex !== -1
              }
              showArrow={activeIndex === index}
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

function NavMainItemSub({
  data,
  showVerticalBorder,
  showArrow,
}: {
  data: AdminSidebarItemItem;
  showVerticalBorder: boolean;
  showArrow: boolean;
}) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        showVerticalBorder={showVerticalBorder}
        showArrow={showArrow}
        isActive={showArrow}
      >
        <Link href={data.url}>
          <span>{data.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
function normlaizePathname(pathname: string) {
  const path = pathname.split("?")[0]?.split("#")[0];
  return "/" + path?.split("/").filter(Boolean).join("/");
}
