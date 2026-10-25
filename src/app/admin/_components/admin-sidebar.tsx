"use client";

import {
  Archive02Icon,
  FolderLibraryIcon,
  Home01Icon,
  Layers01Icon,
  Settings01Icon,
  ShoppingCart01Icon,
  Store01Icon,
  Tag01Icon,
  TradeMarkIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { env } from "~/env";
import { LogoMark } from "./logo-mark";

/** The store's address without the scheme, for the footer block. */
const storeHost = new URL(env.NEXT_PUBLIC_APP_URL).host;

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
};

type NavGroup = {
  /** `null` for the opening group, which needs no heading of its own. */
  label: string | null;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ title: "Dashboard", href: "/admin", icon: Home01Icon }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/admin/products", icon: Tag01Icon },
      { title: "Inventory", href: "/admin/inventory", icon: Archive02Icon },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: FolderLibraryIcon,
      },
      { title: "Brands", href: "/admin/brands", icon: TradeMarkIcon },
      { title: "Attributes", href: "/admin/attributes", icon: Layers01Icon },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart01Icon },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Users", href: "/admin/users", icon: UserMultipleIcon },
      {
        title: "Store settings",
        href: "/admin/settings",
        icon: Settings01Icon,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  // On a phone the navigation covers the page, so following a link closes it.
  const closeMobile = () => setOpenMobile(false);

  /**
   * The most specific matching destination, not every matching one. "/admin"
   * is a prefix of every page, so a plain prefix test lights up Dashboard
   * everywhere. "/admin/products/12" still resolves to Products, since that
   * is the longest entry that matches.
   */
  const activeHref = navGroups
    .flatMap((group) => group.items.map((item) => item.href))
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .reduce<string | null>(
      (best, href) => (best && best.length >= href.length ? best : href),
      null,
    );

  return (
    <Sidebar collapsible="icon">
      {/* 57px with its hairline: the brand tile and name, linking back to the store. Folded, the tile alone stays,
          centred across the rail. */}
      <SidebarHeader className="h-[57px] shrink-0 flex-row items-center border-b p-3 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to the store"
              className="h-8 gap-2 p-0! group-data-[collapsible=icon]:p-0! hover:bg-transparent focus-visible:ring-0"
              render={
                <Link
                  href="/"
                  aria-label="Back to the Gear Verse store"
                  onClick={closeMobile}
                />
              }
            >
              <span className="bg-secondary flex size-8 shrink-0 items-center justify-center rounded-lg shadow-(--control-shadow)">
                <LogoMark className="h-5" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-foreground truncate text-sm font-medium">
                  Gear Verse
                </span>
                <span className="text-muted-foreground truncate text-xs font-normal">
                  Store admin
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Each group is its own bordered band with a faint eyebrow above its items. */}
      <SidebarContent className="gap-0">
        {navGroups.map((group) => (
          <SidebarGroup
            key={group.label ?? "start"}
            className="gap-1 border-b p-3 group-data-[collapsible=icon]:px-2"
          >
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={item.href === activeHref}
                      tooltip={item.title}
                      render={<Link href={item.href} onClick={closeMobile} />}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.75} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* The reference's footer block, here the live store it manages. Folded, only the store button stays. */}
      <SidebarFooter className="flex-row items-center justify-between gap-2 border-t p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
          <p className="text-foreground text-sm font-medium">Storefront</p>
          <p className="text-muted-foreground truncate text-xs">{storeHost}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-[30px] px-[9px] text-xs group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-0"
          nativeButton={false}
          render={<Link href="/" onClick={closeMobile} />}
        >
          <HugeiconsIcon
            icon={Store01Icon}
            strokeWidth={1.75}
            data-icon="inline-start"
            className="size-3.5"
          />
          <span className="group-data-[collapsible=icon]:sr-only">
            Open store
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
