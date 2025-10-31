import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "~/components/ui/dialog";
import { CustomerForm, type CustomerFormValues } from "../forms/customer-form";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AddCustomerDialog() {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: createUser, isPending: isCreatingUser } = useMutation(
    trpc.admin.users.mutations.create.mutationOptions({
      onSuccess: () => {
        toast.success("User created successfully");
        void queryClient.invalidateQueries(
          trpc.admin.users.queries.getPage.infiniteQueryFilter(),
        );
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create user");
      },
    }),
  );

  function handleSubmit(values: CustomerFormValues) {
    createUser(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="w-full rounded-t-none rounded-b-md"
        >
          <PlusCircleIcon />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to the system.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <CustomerForm onSubmit={handleSubmit} />
        </DialogBody>

        <DialogFooter>
          <Button type="submit" form="customer-form">
            Add Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
