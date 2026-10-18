"use client";

import { format, formatDistanceToNowStrict } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { RouterOutput } from "~/trpc/client";
import type { ListColumn } from "../list-grid";
import { UsersTableActions } from "./actions";
import { userRoleMap } from "./filters";

export type UserRow =
  RouterOutput["admin"]["users"]["queries"]["getManagePage"]["data"][number];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const usersColumns: ListColumn<UserRow>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2 font-medium">
              <span className="truncate">{user.name}</span>
              {user.isSelf && (
                <span className="text-muted-foreground text-xs font-normal">
                  You
                </span>
              )}
            </span>
            <span className="text-muted-foreground max-w-64 truncate text-xs">
              {user.email}
            </span>
          </div>
        </div>
      );
    },
    meta: { headerClassName: "w-full" },
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role === "admin" ? "admin" : "user";
      return (
        <Badge variant={role === "admin" ? "brand" : "secondary"}>
          {userRoleMap[role].icon}
          {userRoleMap[role].label}
        </Badge>
      );
    },
  },

  {
    accessorKey: "orderCount",
    header: "Orders",
    cell: ({ row }) => <span>{row.original.orderCount}</span>,
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right tabular-nums",
    },
  },

  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {format(row.original.createdAt, "dd MMM, yyyy")}
      </span>
    ),
    meta: {
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
  },

  {
    accessorKey: "lastActiveAt",
    header: "Last active",
    cell: ({ row }) => {
      const { lastActiveAt } = row.original;
      if (!lastActiveAt) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return (
        // Relative to now, so the server's render can be a minute behind.
        <time
          dateTime={lastActiveAt.toISOString()}
          title={format(lastActiveAt, "dd MMM yyyy, HH:mm")}
          className="text-muted-foreground"
          suppressHydrationWarning
        >
          {formatDistanceToNowStrict(lastActiveAt, { addSuffix: true })}
        </time>
      );
    },
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
  },

  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => {
      const { banned, banReason, banExpiresAt } = row.original;
      if (!banned) {
        return <Badge variant="success">Active</Badge>;
      }

      const until = banExpiresAt
        ? `Until ${format(banExpiresAt, "dd MMM")}`
        : "Permanent";
      return (
        <Tooltip>
          <TooltipTrigger
            render={<span className="inline-flex items-center gap-2" />}
          >
            <Badge variant="error">Banned</Badge>
            <span className="text-muted-foreground text-xs">{until}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 text-pretty">
            {banReason ?? "No reason given"}
          </TooltipContent>
        </Tooltip>
      );
    },
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <UsersTableActions user={row.original} />,
    meta: { headerTitle: "Actions", cellClassName: "text-right" },
  },
];
