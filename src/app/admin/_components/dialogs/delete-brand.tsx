"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, XIcon } from "lucide-react";

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
import { toast } from "~/components/ui/toast";
import { useTRPC } from "~/trpc/client";
import type { BrandRow } from "../tables/brands/columns";

export function DeleteBrandDialog({
  brand,
  open,
  onOpenChange,
}: {
  brand: BrandRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteBrand, isPending } = useMutation(
    trpc.admin.brands.mutations.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Brand deleted successfully");
        void queryClient.invalidateQueries(
          trpc.admin.brands.queries.getPage.pathFilter(),
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't delete the brand");
      },
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {brand.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the brand. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            <XIcon data-icon="inline-start" />
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending || brand.productCount > 0}
            onClick={() => deleteBrand({ brandId: brand.id })}
          >
            {isPending ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <Trash2Icon data-icon="inline-start" />
            )}
            Delete brand
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
