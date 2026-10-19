"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
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
import { Spinner } from "~/components/spinner";
import { useTRPC } from "~/trpc/client";
import {
  AttributeForm,
  type AttributeFormValues,
} from "../../../_components/forms/attribute-form";
import { useReactFlow } from "@xyflow/react";
import { attributeNode } from "../nodes/attribute-node";

export function AddAttributeDialog({
  className,
  attributesLength,
}: {
  className?: string;
  attributesLength?: number;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNodes, fitView } = useReactFlow();
  const [open, setOpen] = useState(false);
  const { mutate: createAttribute, isPending: creatingAttribute } = useMutation(
    trpc.admin.attributes.mutations.create.mutationOptions(),
  );

  function onSubmit(data: AttributeFormValues) {
    createAttribute(data, {
      onSuccess: (response) => {
        void queryClient.invalidateQueries(
          trpc.admin.attributes.queries.getAll.queryFilter(),
        );
        addNodes([attributeNode(response, attributesLength ?? 0)]);
        void fitView();
        setOpen(false);
      },
      onError: () => {
        toast.error("This attribute already exists");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className={className}
            disabled={creatingAttribute}
          />
        }
      >
        <PlusIcon data-icon="inline-start" />
        Add Attribute
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Attribute</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <AttributeForm onSubmit={onSubmit} />
        </DialogBody>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            <XIcon data-icon="inline-start" />
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="attribute-form"
            disabled={creatingAttribute}
          >
            {creatingAttribute ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
