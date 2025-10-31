import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useTRPC } from "~/trpc/client";
import { CustomerForm, type CustomerFormValues } from "../forms/customer-form";

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
