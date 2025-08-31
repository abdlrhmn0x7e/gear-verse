"use client";

import { LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { authClient } from "~/lib/auth-client";

export function ProfileDropdown({ className }: { className?: string }) {
  const { data } = authClient.useSession();

  if (!data) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("cursor-pointer rounded-full", className)}
      >
        <Avatar>
          <AvatarImage
            src={data.user.image ?? undefined}
            alt={data.user.name}
          />
          <AvatarFallback>{data.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
              <AvatarImage
                src={data.user.image ?? undefined}
                alt={data.user.name}
              />
              <AvatarFallback>{data.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{data.user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {data.user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => void authClient.signOut()}>
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
