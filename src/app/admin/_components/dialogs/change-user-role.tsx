"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheckIcon, ShieldMinusIcon } from "lucide-react";
import { toast } from "~/components/ui/toast";
import { Spinner } from "~/components/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import type { UserRole } from "~/lib/schemas/contracts/admin/users";
import { useTRPC } from "~/trpc/client";

/** Confirms switching a user between customer and admin. */
export function ChangeUserRoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: { id: number; name: string; role: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const role: UserRole = user.role === "admin" ? "user" : "admin";
  const promoting = role === "admin";

  const { mutate: setRole, isPending } = useMutation(
    trpc.admin.users.mutations.setRole.mutationOptions({
      onSuccess: () => {
        toast.success(
          promoting
            ? `${user.name} is now an admin`
            : `${user.name} is now a customer`,
        );
        void queryClient.invalidateQueries(
          trpc.admin.users.queries.getManagePage.infiniteQueryFilter(),
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't change the role");
      },
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Controls inherit the dialog's elevation variable; they stay flat. */}
      <AlertDialogContent className="[&_[data-slot]]:[--surface-shadow:none]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {promoting
              ? `Make ${user.name} an admin?`
              : `Make ${user.name} a customer?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {promoting
              ? "They'll get full access to this admin: products, orders, users and store settings."
              : "They'll lose access to this admin. Their account and orders stay as they are."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          {/* A plain button, so the dialog stays open until the change lands. */}
          <Button
            disabled={isPending}
            onClick={() => setRole({ userId: user.id, role })}
          >
            {isPending ? (
              <Spinner />
            ) : promoting ? (
              <ShieldCheckIcon />
            ) : (
              <ShieldMinusIcon />
            )}
            {promoting ? "Make admin" : "Make customer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
