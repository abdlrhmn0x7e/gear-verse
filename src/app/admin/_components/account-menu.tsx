"use client";

import {
  Logout03Icon,
  Store01Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { useSignOut } from "~/components/profile-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";

/** The signed-in account: the way back to the store, and sign out. The admin is always dark, so it has no theme switch. */
export function AccountMenu() {
  const { data, isPending } = authClient.useSession();
  const { setOpenMobile } = useSidebar();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  if (isPending) {
    return (
      <SidebarMenuItem
        aria-hidden
        className="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:px-0"
      >
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <span className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-36" />
        </span>
      </SidebarMenuItem>
    );
  }

  if (!data) return null;

  const { user } = data;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton size="lg" aria-label={`Account: ${user.name}`} />
          }
        >
          <Avatar className="size-8 rounded-lg after:rounded-lg">
            <AvatarImage
              src={user.image ?? undefined}
              alt=""
              className="rounded-lg"
            />
            <AvatarFallback className="rounded-lg">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-sidebar-foreground truncate font-medium">
              {user.name}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </span>
          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            strokeWidth={1.5}
            className="text-muted-foreground ml-auto size-4"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<Link href="/" onClick={() => setOpenMobile(false)} />}
            >
              <HugeiconsIcon icon={Store01Icon} strokeWidth={2} />
              Back to store
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isSigningOut} onClick={() => signOut()}>
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
