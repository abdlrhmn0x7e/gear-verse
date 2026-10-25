"use client";

import { Logout03Icon, Store01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { useSignOut } from "~/components/profile-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";

/**
 * The signed-in account as the page header's profile pill: the way back to the
 * store, and sign out. The admin is always dark, so it has no theme switch.
 * Phones show the avatar alone.
 */
export function AccountMenu() {
  const { data, isPending } = authClient.useSession();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  if (isPending) {
    return (
      <Skeleton
        aria-hidden
        className="h-[30px] w-[30px] rounded-full sm:w-28"
      />
    );
  }

  if (!data) return null;

  const { user } = data;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account: ${user.name}`}
        className="surface-control text-foreground inline-flex h-[30px] max-w-48 shrink-0 items-center gap-1.5 rounded-full p-1 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 sm:pe-2.5"
      >
        <Avatar className="size-[22px]">
          <AvatarImage src={user.image ?? undefined} alt="" />
          <AvatarFallback className="text-[0.625rem]">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate max-sm:hidden">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-foreground truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="truncate">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/" />}>
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
  );
}
