"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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
import { useTRPC, type RouterOutput } from "~/trpc/client";
import {
  AttributeForm,
  type AttributeFormValues,
} from "../../_components/forms/attribute-form";
import { IconEdit } from "@tabler/icons-react";

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];

export function EditAttributeDialog({
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
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="focus-visible:ring-0">
          <IconEdit />
        </Button>
      </DialogTrigger>
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
