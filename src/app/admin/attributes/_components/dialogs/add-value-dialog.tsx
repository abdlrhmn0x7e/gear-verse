import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogBody,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import {
  AttributeValueForm,
  type AttributeValueFormValues,
} from "../../../_components/forms/attribute-value-form";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "~/components/spinner";
import { useDialog } from "~/hooks/use-dialog";

export function AddValueDialog({ attributeId }: { attributeId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const dialog = useDialog();
  const { mutate: createAttributeValue, isPending: creatingAttributeValue } =
    useMutation(
      trpc.admin.attributeValues.mutations.create.mutationOptions({
        onSuccess: () => {
          void queryClient.invalidateQueries(
            trpc.admin.attributeValues.queries.findAll.queryFilter({
              attributeId,
            }),
          );
          dialog.dismiss();
        },
      }),
    );

  function onSubmit(values: AttributeValueFormValues) {
    createAttributeValue({ ...values, attributeId });
  }

  return (
    <Dialog {...dialog.props}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon data-icon="inline-start" />
          Add Value
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attribute Value</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <AttributeValueForm onSubmit={onSubmit} />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <XIcon data-icon="inline-start" />
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="attribute-value-form"
            disabled={creatingAttributeValue}
          >
            {creatingAttributeValue ? (
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
