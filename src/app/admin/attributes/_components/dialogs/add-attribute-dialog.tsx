"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
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
import { Spinner } from "~/components/spinner";
import { useTRPC } from "~/trpc/client";
import {
  AttributeForm,
  type AttributeFormValues,
} from "../../../_components/forms/attribute-form";
import { useReactFlow } from "@xyflow/react";

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
        addNodes([
          {
            id: response.id.toString(),
            position: { x: 0, y: 60 * (attributesLength ?? 0) },
            type: "attribute",
            data: response,
          },
        ]);
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
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={className}
          disabled={creatingAttribute}
        >
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
          <Button
            type="submit"
            form="attribute-form"
            disabled={creatingAttribute}
          >
            {creatingAttribute ? <Spinner /> : <PlusCircleIcon />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
