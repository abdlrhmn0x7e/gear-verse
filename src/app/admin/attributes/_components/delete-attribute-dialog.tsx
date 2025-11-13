"use client";

import { IconTrash } from "@tabler/icons-react";
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
  ...props
}: { id: number; slug: string } & React.ComponentProps<typeof AlertDialog>) {
  const trpc = useTRPC();
  const { setNodes } = useReactFlow();
  const queryClient = useQueryClient();
  const { mutate: deleteAttribute, isPending } = useMutation(
    trpc.admin.attributes.mutations.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.admin.attributes.queries.getAll.queryFilter(),
        );
        props.onOpenChange?.(false);
      },
    }),
  );

  function handleDelete() {
    deleteAttribute(
      { id },
      {
        onSuccess: () => {
          setNodes((nds) => nds.filter((node) => node.id !== slug));
        },
      },
    );
  }

  return (
    <AlertDialog {...props}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="focus-visible:ring-0"
          disabled={isPending}
        >
          <IconTrash />
        </Button>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
