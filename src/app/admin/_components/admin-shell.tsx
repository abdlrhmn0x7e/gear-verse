"use client";

import { usePathname } from "next/navigation";
import { type RefObject, useEffect, useRef, useState } from "react";

import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { useIsMobile } from "~/hooks/use-mobile";
import { AdminSidebar } from "./admin-sidebar";

/**
 * Editors that want the width: anything below a product (the new product
 * form, a product, its variants). The product list itself keeps the
 * navigation open.
 */
const COLLAPSE_SIDEBAR_ROUTES = [/^\/admin\/products\/[^/]+/];

/** A page at its full reading width: 80rem less its 0.5rem trim, with 2.25rem padding each side. */
const READING_WIDTH_REM = 84;

/** The open navigation's width (`--sidebar-width`). */
const OPEN_SIDEBAR_REM = 16;

/** The admin chrome: the inset navigation beside the content card that every page fills with a `PageLayout`. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const inset = useRef<HTMLElement>(null);
  const sidebar = useRouteSidebarOpen(inset);

  return (
    <SidebarProvider open={sidebar.open} onOpenChange={sidebar.setOpen}>
      <AdminSidebar />
      <SidebarInset ref={inset} className="min-w-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Whether the page would keep its full reading width with the navigation open.
 * The page and the navigation's gap share the window, so their sum doesn't
 * change while the navigation slides; resizing the window does change it.
 */
function useRoomForOpenSidebar(inset: RefObject<HTMLElement | null>) {
  const [roomy, setRoomy] = useState(false);
  // The gap only exists on desktop, so look for it again on crossing the breakpoint.
  const isMobile = useIsMobile();

  useEffect(() => {
    const page = inset.current;
    const gap = document.querySelector<HTMLElement>(
      '[data-slot="sidebar-gap"]',
    );

    if (!page || !gap) return;

    const measure = () => {
      const rem = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const ifOpen =
        page.offsetWidth + gap.offsetWidth - OPEN_SIDEBAR_REM * rem;

      setRoomy(ifOpen >= READING_WIDTH_REM * rem);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(page);
    observer.observe(gap);

    return () => observer.disconnect();
  }, [inset, isMobile]);

  return roomy;
}

/**
 * Editor pages fold the navigation to its icon rail for width, unless the page
 * keeps its full reading width beside it; every other page opens it. The route
 * and the room decide on each switch between the two, and a manual toggle
 * holds until the next switch. The state is adjusted during render rather than
 * in an effect so an editor renders collapsed on the server, which can't
 * measure anything, and never animates out of an open frame.
 */
function useRouteSidebarOpen(inset: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  const wantsRoom = COLLAPSE_SIDEBAR_ROUTES.some((route) =>
    route.test(pathname),
  );

  const roomy = useRoomForOpenSidebar(inset);
  const collapse = wantsRoom && !roomy;
  const [open, setOpen] = useState(!collapse);
  const [appliedCollapse, setAppliedCollapse] = useState(collapse);

  if (collapse !== appliedCollapse) {
    setAppliedCollapse(collapse);
    setOpen(!collapse);
  }

  return { open, setOpen };
}
