"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { domAnimation, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { cn } from "~/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { useIsMobile } from "~/hooks/use-mobile";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
} from "@hugeicons/core-free-icons";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (openState: boolean) => {
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen(!open);
  }, [isMobile, open, setOpen, setOpenMobile]);

  // Cmd+B on a Mac, Ctrl+B elsewhere, toggles the sidebar from anywhere on the
  // page. Rich text editors claim the same keys for bold, so a keystroke they
  // handled, or one typed into editable content, is left to them.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.defaultPrevented ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      toggleSidebar();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Drawer
        swipeDirection={side}
        open={openMobile}
        onOpenChange={setOpenMobile}
      >
        <DrawerContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="text-sidebar-foreground before:bg-sidebar p-2 data-[swipe-direction=left]:w-(--sidebar-width) data-[swipe-direction=right]:w-(--sidebar-width)"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>Sidebar</DrawerTitle>
            <DrawerDescription>Displays the mobile sidebar.</DrawerDescription>
          </DrawerHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : variant === "inset"
              ? // One pixel past the collapsed column, so the card's outer ring isn't painted over.
                "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1px)]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-20 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:start-0 data-[side=left]:group-data-[collapsible=offcanvas]:start-[calc(var(--sidebar-width)*-1)] data-[side=right]:end-0 data-[side=right]:group-data-[collapsible=offcanvas]:end-[calc(var(--sidebar-width)*-1)] md:flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : variant === "inset"
              ? // Collapsed, the column is exactly the icon width and the card
                // sits flush against it, so the icons centre in the strip.
                "p-2 group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[collapsible=icon]:px-0"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-e group-data-[side=right]:border-s",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:ring-sidebar-border flex size-full flex-col group-data-[variant=floating]:rounded-2xl group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="ghost"
            size="icon-sm"
            className={cn(
              className,
              "cursor-w-resize",
              !open && "cursor-e-resize",
            )}
            onClick={(event) => {
              onClick?.(event);
              toggleSidebar();
            }}
            {...props}
          />
        }
      >
        <HugeiconsIcon
          icon={open ? LayoutAlignLeftIcon : LayoutAlignRightIcon}
          strokeWidth={2}
        />
        <span className="sr-only">Toggle Sidebar</span>
      </TooltipTrigger>
      <TooltipContent>{open ? "Close sidebar" : "Open sidebar"}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The grab handle on the content card's edge. A short vertical stroke at
 * rest; on hover its midpoint springs sideways so it becomes a chevron
 * pointing the way the sidebar will move, with a tooltip beside it. One path
 * with round joins, so the fold never shows a seam. The chevron reads the
 * sidebar state directly, so it flips the moment the sidebar is toggled
 * rather than when the width transition finishes. Only the handle itself is
 * the target: the rest of the edge is left alone.
 */
const RAIL_SPRING = { type: "spring", stiffness: 520, damping: 32 } as const;

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar, open } = useSidebar();
  const [hovered, setHovered] = React.useState(false);
  const collapsed = !open;
  // Midpoint x within the 16px box: centred at rest, pushed toward the
  // sidebar for "<" (collapse) and away from it for ">" (expand).
  const tip = hovered ? (collapsed ? 12 : 4) : 8;
  // MotionConfig's reduced motion only stills transforms, and this morphs a path.
  const reduceMotion = useReducedMotion();

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              data-sidebar="rail"
              data-slot="sidebar-rail"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              tabIndex={-1}
              onClick={toggleSidebar}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
              className={cn(
                "group/rail absolute top-1/2 start-0 z-20 hidden h-10 w-4 -translate-y-1/2 cursor-pointer items-center justify-center outline-none md:flex",
                className,
              )}
              {...props}
            />
          }
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={cn(
              "text-border transition-colors duration-150",
              hovered && "text-foreground/60",
            )}
          >
            <LazyMotion features={domAnimation} strict>
              {/* Starts at its target, so no frame renders before `d` has a value. */}
              <m.path
                initial={false}
                animate={{ d: `M8 2 L${tip} 8 L8 14` }}
                transition={reduceMotion ? { duration: 0 } : RAIL_SPRING}
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </LazyMotion>
          </svg>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={2}
          className="rounded-lg px-2 py-1"
        >
          {collapsed ? "Expand" : "Collapse"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** The content card. On desktop the inset variant floats it beside the sidebar with the rail on its left edge. */
function SidebarInset({
  className,
  children,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background md:peer-data-[variant=inset]:ring-sidebar-border relative flex h-svh w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:h-[calc(100svh-1rem)] md:peer-data-[variant=inset]:overflow-hidden md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:ring-1",
        className,
      )}
      {...props}
    >
      <SidebarRail />
      {children}
    </main>
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-input/50 h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 p-2 [--radius:var(--radius-xl)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto overscroll-contain [--radius:var(--radius-xl)] group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-xl px-3 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  });
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 end-3 flex aspect-square w-5 items-center justify-center rounded-xl p-0 outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  });
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-start text-sm text-sidebar-foreground/75 ring-sidebar-ring outline-hidden transition-[width,height,padding,color,background-color] duration-150 group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-9 md:h-8",
        sm: "h-8 text-xs",
        lg: "h-12 group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> & {
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar();

  const button = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      props,
    ),
    render: !tooltip ? render : <TooltipTrigger render={render} />,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  });

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip disabled={state !== "collapsed" || isMobile}>
      {button}
      <TooltipContent side="right" align="center" {...tooltip} />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> & {
  showOnHover?: boolean;
}) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1.5 end-1 flex aspect-square w-5 items-center justify-center rounded-xl p-0 outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-2 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  });
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground pointer-events-none absolute end-1 flex h-5 min-w-5 items-center justify-center rounded-xl px-1 text-xs font-medium tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  });

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-xl px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-xl"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  showVerticalBorder = false,
  showArrow = false,
  children,
  className,
  ...props
}: useRender.ComponentProps<"a"> & {
  size?: "sm" | "md";
  isActive?: boolean;
  showVerticalBorder?: boolean;
  showArrow?: boolean;
}) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-xl px-3 outline-hidden group-data-[collapsible=icon]:hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
          "group/sidebar-menu-sub-button relative ps-9",
          className,
        ),
        children: (
          <div className="flex w-full items-center">
            {showVerticalBorder && (
              <div className="bg-primary absolute top-0 bottom-0 start-4 w-0.5" />
            )}
            {showArrow && (
              <div className="bg-primary absolute top-0 bottom-0 start-4 z-10 h-1/3 w-0.5" />
            )}

            <svg
              className={cn(
                "text-primary! absolute top-1 start-4 -ms-[3.2px] size-4 stroke-3 opacity-0 transition-opacity duration-100",
                showArrow
                  ? "opacity-100"
                  : "group-hover/sidebar-menu-sub-button:opacity-50",
              )}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4V10.4C6 13.4928 8.50721 16 11.6 16H18"
                stroke="currentColor"
                strokeWidth="inherit"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.6 16L15 12"
                stroke="currentColor"
                strokeWidth="inherit"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.6 16L15 20"
                stroke="currentColor"
                strokeWidth="inherit"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="flex-1 **:block **:w-full">{children}</div>
          </div>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  });
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
