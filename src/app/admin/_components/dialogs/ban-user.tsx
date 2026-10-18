"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BanIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { toast } from "~/components/ui/toast";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  banUserInputSchema,
  type BanDuration,
} from "~/lib/schemas/contracts/admin/users";
import { useTRPC } from "~/trpc/client";

const banFormSchema = banUserInputSchema.omit({ userId: true });
type BanFormValues = z.input<typeof banFormSchema>;

const durations: { value: BanDuration; label: string }[] = [
  { value: "1d", label: "1 day" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "permanent", label: "Permanent" },
];

/** Bans a user for a while or for good, signing them out everywhere. */
export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: { id: number; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: { reason: "", duration: "7d" },
  });

  const { mutate: ban, isPending } = useMutation(
    trpc.admin.users.mutations.ban.mutationOptions({
      onSuccess: () => {
        toast.success(`${user.name} is banned`);
        void queryClient.invalidateQueries(
          trpc.admin.users.queries.getManagePage.infiniteQueryFilter(),
        );
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't ban the user");
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Controls inherit the dialog's elevation variable; they stay flat.
        className="[&_[data-slot]]:[--surface-shadow:none]"
        // Straight to the reason; the length already has a default.
        initialFocus={() => {
          form.setFocus("reason");
          return false;
        }}
      >
        <DialogHeader>
          <DialogTitle>Ban {user.name}</DialogTitle>
          <DialogDescription>
            They&apos;re signed out everywhere and can&apos;t sign in until the
            ban ends.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form
              id="ban-user-form"
              className="flex flex-col gap-5"
              onSubmit={form.handleSubmit((values) =>
                ban({ ...values, userId: user.id }),
              )}
            >
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        spacing={0}
                        className="w-full"
                        value={field.value}
                        // Clicking the chosen option again would clear it.
                        onValueChange={(value) =>
                          value && field.onChange(value)
                        }
                      >
                        {durations.map((duration) => (
                          <ToggleGroupItem
                            key={duration.value}
                            value={duration.value}
                            className="data-[state=on]:bg-selected data-[state=on]:text-selected-foreground data-[state=on]:border-selected data-[state=on]:hover:bg-selected flex-1"
                          >
                            {duration.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Reason{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="h-24 resize-none"
                        placeholder="e.g. Repeated fake orders"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="ban-user-form"
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <BanIcon />}
            Ban user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
