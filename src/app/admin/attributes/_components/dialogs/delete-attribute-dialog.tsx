"use client";

import { Trash2Icon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/client";

export function DeleteAttributeAlertDialog({
  id,
  slug,
  name,
  ...props
}: {
  id: number;
  slug: string;
  name: string;
  onOpenChange?: (open: boolean) => void;
} & Omit<React.ComponentProps<typeof AlertDialog>, "onOpenChange">) {
  const trpc = useTRPC();
  const { deleteElements } = useReactFlow();
  const queryClient = useQueryClient();
  const { mutate: deleteAttribute, isPending } = useMutation(
    trpc.admin.attributes.mutations.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.attributes.queries.getAll.queryFilter(),
        );
        void deleteElements({
          nodes: [
            {
              id: `attribute-${slug}-${id}`,
            },
          ],
        });
        props.onOpenChange?.(false);
      },
    }),
  );

  function handleDelete() {
    deleteAttribute({ id });
  }

  return (
    <AlertDialog {...props}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="focus-visible:ring-0"
            disabled={isPending}
            aria-label={`Delete ${name}`}
          />
        }
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            attribute and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <XIcon data-icon="inline-start" />
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete attribute
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
