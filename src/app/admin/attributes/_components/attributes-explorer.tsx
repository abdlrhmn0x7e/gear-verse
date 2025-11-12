"use client";

import { IconKeyframe, IconKeyframeFilled } from "@tabler/icons-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  CheckCheckIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusCircleIcon,
  SaveIcon,
  SlidersHorizontalIcon,
  ToggleRightIcon,
  TrashIcon,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Heading } from "~/components/heading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { useDialog } from "~/hooks/use-dialog";
import { cn } from "~/lib/utils";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import {
  AttributeForm,
  type AttributeFormValues,
} from "../../_components/forms/attribute-form";
import { useAttributeStore } from "../_store/provider";

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];

export function AttributesExplorer() {
  const trpc = useTRPC();
  const selectedAttribute = useAttributeStore(
    (state) => state.selectedAttribute,
  );
  const setSelectedAttribute = useAttributeStore(
    (state) => state.setSelectedAttribute,
  );
  const { data: attributes } = useSuspenseQuery(
    trpc.admin.attributes.queries.getAll.queryOptions(),
  );

  function handleSelectAttribute(attribute: Attribute) {
    if (selectedAttribute?.id === attribute.id) {
      return;
    }

    setSelectedAttribute(attribute);
  }

  return (
    <div className="relative h-full space-y-3">
      <div className="flex items-center justify-between">
        <Heading level={5}>Attributes</Heading>
        <AddAttributeDialog />
      </div>

      <div className="space-y-1">
        {attributes?.map((attribute) => (
          <div
            key={attribute.id}
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "group w-full justify-between p-0",
              }),
              selectedAttribute?.id === attribute.id
                ? "bg-background border-border"
                : "",
            )}
          >
            <button
              className="flex flex-1 cursor-pointer items-center gap-2 p-2 focus-visible:outline-none"
              onClick={() => handleSelectAttribute(attribute)}
            >
              {selectedAttribute?.id === attribute.id ? (
                <IconKeyframe />
              ) : (
                <IconKeyframeFilled />
              )}
              <span className="capitalize">{attribute.name}</span>
            </button>

            <div className="flex items-center gap-2 px-2">
              <AttributeTypeBadge type={attribute.type} />
              <AttributeActionsMenu attribute={attribute} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttributeActionsMenu({ attribute }: { attribute: Attribute }) {
  const editDialog = useDialog();
  const deleteDialog = useDialog();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="order-last ml-auto cursor-pointer p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:outline-none data-[state=open]:opacity-100">
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={8}
          alignOffset={0}
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={editDialog.trigger}>
            <PencilIcon />
            Edit Attribute
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive-ghost"
            onClick={deleteDialog.trigger}
          >
            <TrashIcon />
            Delete Attribute
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAttributeDialog attribute={attribute} {...editDialog.props} />
      <DeleteAttributeAlertDialog id={attribute.id} {...deleteDialog.props} />
    </>
  );
}

function AttributeTypeBadge({ type }: { type: Attribute["type"] }) {
  switch (type) {
    case "SELECT":
      return (
        <Badge variant="success">
          <CheckIcon /> Select
        </Badge>
      );
    case "MULTISELECT":
      return (
        <Badge variant="secondary">
          <CheckCheckIcon /> Multi Select
        </Badge>
      );
    case "RANGE":
      return (
        <Badge variant="warning">
          <SlidersHorizontalIcon /> Range
        </Badge>
      );
    case "BOOLEAN":
      return (
        <Badge variant="default">
          <ToggleRightIcon /> Boolean
        </Badge>
      );
    default:
      return null;
  }
}

export function AttributesExplorerSkeleton() {
  return (
    <div className="relative h-full space-y-3">
      <div className="flex items-center justify-between">
        <Heading level={5}>Attributes</Heading>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

function AddAttributeDialog() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { mutate: createAttribute } = useMutation(
    trpc.admin.attributes.mutations.create.mutationOptions(),
  );

  function onSubmit(data: AttributeFormValues) {
    createAttribute(data, {
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.admin.attributes.queries.getAll.queryFilter(),
        );
        setOpen(false);
      },
      onError: () => {
        toast.error("This attribute already exists");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <PlusCircleIcon />
          Add Attribute
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Attribute</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <AttributeForm onSubmit={onSubmit} />
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive-outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="attribute-form">
            <PlusCircleIcon />
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditAttributeDialog({
  attribute,
  ...props
}: { attribute: Attribute } & React.ComponentProps<typeof Dialog>) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateAttribute } = useMutation(
    trpc.admin.attributes.mutations.update.mutationOptions(),
  );

  function onSubmit(data: AttributeFormValues) {
    updateAttribute(
      { id: attribute.id, ...data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(
            trpc.admin.attributes.queries.getAll.queryFilter(),
          );
          props.onOpenChange?.(false);
        },
        onError: () => {
          toast.error("This attribute already exists");
        },
      },
    );
  }

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attribute</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <AttributeForm onSubmit={onSubmit} defaultValues={attribute} />
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive-outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="attribute-form">
            <SaveIcon />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAttributeAlertDialog({
  id,
  ...props
}: { id: number } & React.ComponentProps<typeof AlertDialog>) {
  const trpc = useTRPC();
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
    deleteAttribute({ id });
  }

  return (
    <AlertDialog {...props}>
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
