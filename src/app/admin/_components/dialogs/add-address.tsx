import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  AddressForm,
  type AddressFormValues,
} from "~/components/forms/address-form";
import { PlusIcon } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";
import { useState } from "react";
import { Spinner } from "~/components/spinner";

export function AddAddressDialog({ userId }: { userId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { mutate: createAddress, isPending: isCreatingAddress } = useMutation(
    trpc.admin.addresses.mutations.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Address created successfully");
        void queryClient.invalidateQueries(
          trpc.admin.addresses.queries.findByUserId.queryFilter({
            userId,
          }),
        );
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create address");
      },
    }),
  );
  function onSubmit(values: AddressFormValues) {
    createAddress({ userId, ...values });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" />}>
        <PlusIcon data-icon="inline-start" />
        Add Address
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>
        <DialogBody className="-mx-6 -my-1 min-h-0 overflow-y-auto px-6 py-1">
          <AddressForm onSubmit={onSubmit} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            form="address-form"
            disabled={isCreatingAddress}
          >
            {isCreatingAddress ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Add Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
