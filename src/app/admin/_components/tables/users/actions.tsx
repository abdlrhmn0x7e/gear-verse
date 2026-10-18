"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BanIcon,
  MoreHorizontal,
  ReceiptTextIcon,
  ShieldCheckIcon,
  ShieldMinusIcon,
  UndoIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserSearchParams } from "~/app/admin/_hooks/use-user-search-params";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTRPC } from "~/trpc/client";
import { BanUserDialog } from "../../dialogs/ban-user";
import { ChangeUserRoleDialog } from "../../dialogs/change-user-role";
import type { UserRow } from "./columns";

export function UsersTableActions({ user }: { user: UserRow }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [, setParams] = useUserSearchParams();
  // The dialogs live outside the menu, which unmounts as it closes.
  const [dialog, setDialog] = useState<"role" | "ban" | null>(null);

  const { mutate: unban, isPending: isUnbanning } = useMutation(
    trpc.admin.users.mutations.unban.mutationOptions({
      onSuccess: () => {
        toast.success(`${user.name} is no longer banned`);
        void queryClient.invalidateQueries(
          trpc.admin.users.queries.getManagePage.infiniteQueryFilter(),
        );
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't unban the user");
      },
    }),
  );

  const isAdmin = user.role === "admin";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Actions for {user.name}</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">
            {user.name}
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => void setParams({ ordersOf: user.id })}
            >
              <ReceiptTextIcon />
              View orders
            </DropdownMenuItem>
            {/* The server refuses these on your own account too. */}
            <DropdownMenuItem
              disabled={user.isSelf}
              onSelect={() => setDialog("role")}
            >
              {isAdmin ? <ShieldMinusIcon /> : <ShieldCheckIcon />}
              {isAdmin ? "Make customer" : "Make admin"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {user.banned ? (
            <DropdownMenuItem
              disabled={isUnbanning}
              onSelect={() => unban({ userId: user.id })}
            >
              <UndoIcon />
              Unban
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              disabled={user.isSelf}
              onSelect={() => setDialog("ban")}
            >
              <BanIcon />
              Ban…
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeUserRoleDialog
        user={user}
        open={dialog === "role"}
        onOpenChange={(open) => setDialog(open ? "role" : null)}
      />
      <BanUserDialog
        user={user}
        open={dialog === "ban"}
        onOpenChange={(open) => setDialog(open ? "ban" : null)}
      />
    </>
  );
}
