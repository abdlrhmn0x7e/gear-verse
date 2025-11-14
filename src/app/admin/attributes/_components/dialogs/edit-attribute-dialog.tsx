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
} from "../../../_components/forms/attribute-form";
import { IconEdit } from "@tabler/icons-react";
import { useReactFlow } from "@xyflow/react";
import { Spinner } from "~/components/spinner";
import { useDialog } from "~/hooks/use-dialog";

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];

export function EditAttributeDialog({ attribute }: { attribute: Attribute }) {
  const trpc = useTRPC();
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const { mutate: updateAttribute, isPending: updatingAttribute } = useMutation(
    trpc.admin.attributes.mutations.update.mutationOptions(),
  );

  const { setNodes, updateNodeData } = useReactFlow();

  function onSubmit(data: AttributeFormValues) {
    updateAttribute(
      { id: attribute.id, ...data },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries(
            trpc.admin.attributes.queries.getAll.queryFilter(),
          );

          updateNodeData(`attribute-${attribute.slug}-${attribute.id}`, res);

          dialog.dismiss();
        },
        onError: () => {
          toast.error("This attribute already exists");
        },
      },
    );
  }

  return (
    <Dialog {...dialog.props}>
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
          <Button
            type="submit"
            form="attribute-form"
            disabled={updatingAttribute}
          >
            {updatingAttribute ? <Spinner /> : <SaveIcon />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
