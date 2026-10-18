"use client";

import {
  Archive02Icon,
  FolderLibraryIcon,
  Home01Icon,
  Layers01Icon,
  ShoppingCart01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "~/components/logo";
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
import { AccountMenu } from "./account-menu";
import { LogoMark } from "./logo-mark";

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
      { title: "Attributes", href: "/admin/attributes", icon: Layers01Icon },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart01Icon },
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
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* A 48px row, the height of the card's top bar, so the logo sits on
                that bar's centre line. Folded, the 32px icon button keeps the
                same line with 8px above and below. */}
            <SidebarMenuButton
              size="lg"
              tooltip="Gear Verse admin"
              className="focus-visible:bg-sidebar-accent group-data-[collapsible=icon]:hover:bg-sidebar-accent/50 px-2 group-data-[collapsible=icon]:my-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! hover:bg-transparent focus-visible:ring-0"
              asChild
            >
              <Link
                href="/admin"
                aria-label="Gear Verse admin home"
                onClick={closeMobile}
              >
                <LogoMark className="hidden h-6 group-data-[collapsible=icon]:block" />
                <Logo className="h-10 w-auto group-data-[collapsible=icon]:hidden" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Groups sit close: a short heading is enough to separate them. */}
      <SidebarContent className="gap-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label ?? "start"} className="py-1.5">
            {group.label && (
              <SidebarGroupLabel className="h-7 group-data-[collapsible=icon]:-mt-7">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={item.href === activeHref}
                      tooltip={item.title}
                      asChild
                    >
                      <Link href={item.href} onClick={closeMobile}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <AccountMenu />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
