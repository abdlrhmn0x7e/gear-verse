"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SaveIcon, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/toast";
import { useIsMobile } from "~/hooks/use-mobile";
import { renameUserInputSchema } from "~/lib/schemas/contracts/admin/users";
import { useTRPC } from "~/trpc/client";
import { useRefreshOrderViews } from "../../_hooks/use-refresh-order-views";

const renameFormSchema = renameUserInputSchema.pick({ name: true });
type RenameFormValues = z.infer<typeof renameFormSchema>;

/** Names a guest customer; opens over the order drawer it is rendered inside. */
export function RenameGuestDrawer({
  userId,
  defaultName,
  open,
  onOpenChange,
}: {
  userId: number;
  defaultName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="data-[swipe-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle className="text-lg">Name this guest</DrawerTitle>
          <DrawerDescription>
            Guests check out without an account. The name shows on their orders
            here; they stay a guest until they sign up.
          </DrawerDescription>
        </DrawerHeader>
        {/* remounts on open, so the field starts from the current recipient */}
        {open && (
          <RenameGuestForm
            userId={userId}
            defaultName={defaultName}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function RenameGuestForm({
  userId,
  defaultName,
  onDone,
}: {
  userId: number;
  defaultName: string;
  onDone: () => void;
}) {
  const trpc = useTRPC();
  const refreshOrderViews = useRefreshOrderViews();
  const form = useForm<RenameFormValues>({
    resolver: zodResolver(renameFormSchema),
    defaultValues: { name: defaultName },
  });

  const { mutate: rename, isPending } = useMutation(
    trpc.admin.users.mutations.rename.mutationOptions({
      onSuccess: () => {
        toast.success("Customer named");
        void refreshOrderViews();
        onDone();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't save the name. Try again.");
      },
    }),
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit(({ name }) => rename({ userId, name }))(e);
  }

  return (
    <>
      <DrawerBody className="pt-2">
        <form id="rename-guest-form" onSubmit={handleSubmit}>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="guest-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="guest-name"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
      </DrawerBody>
      <DrawerFooter className="flex-col-reverse sm:flex-row sm:justify-end">
        <DrawerClose render={<Button variant="outline" />}>
          <XIcon data-icon="inline-start" />
          Cancel
        </DrawerClose>
        <Button type="submit" form="rename-guest-form" disabled={isPending}>
          {isPending ? (
            <Spinner size="small" data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save
        </Button>
      </DrawerFooter>
    </>
  );
}
