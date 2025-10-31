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
import { IconHomePlus } from "@tabler/icons-react";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      <DialogTrigger asChild>
        <Button className="w-full rounded-t-none rounded-b-md" variant="ghost">
          <IconHomePlus />
          Add Address
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <AddressForm onSubmit={onSubmit} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="submit"
            form="address-form"
            disabled={isCreatingAddress}
          >
            {isCreatingAddress ? <Spinner /> : <IconHomePlus />}
            Add Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
