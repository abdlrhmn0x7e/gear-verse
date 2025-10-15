"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteIcon, CreditCardIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Skeleton } from "~/components/ui/skeleton";

import { IconHomeOff, IconHomePlus } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { checkoutInputSchema } from "~/lib/schemas/contracts/public/checkout";
import { api } from "~/trpc/react";
import { AddAddressDrawerDialog } from "./add-address-drawer-dialog";

const checkoutFormSchema = checkoutInputSchema;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm({
  onSubmit,
}: {
  onSubmit: (data: CheckoutFormValues) => void;
}) {
  const utils = api.useUtils();
  const { data: addresses, isPending: addressesPending } =
    api.public.checkout.queries.getAddresses.useQuery();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: async () => {
      const addresses =
        await utils.public.checkout.queries.getAddresses.fetch();

      return {
        paymentMethod: "COD",
        addressId: addresses[0]?.id ?? 0,
      };
    },
  });

  if (form.formState.isLoading || addressesPending) {
    return <CheckoutFormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        id="checkout-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-2"
                >
                  <FormItem className="has-checked:bg-primary/10 has-checked:border-primary has-checked:text-foreground flex items-center gap-2 rounded-lg border p-4">
                    <FormControl>
                      <RadioGroupItem value="COD" className="hidden" />
                    </FormControl>
                    <FormLabel className="flex items-center gap-2">
                      <BanknoteIcon className="size-4" />
                      Cash on Delivery
                    </FormLabel>
                  </FormItem>

                  <FormItem className="has-checked:bg-primary has-checked:text-primary-foreground flex items-center gap-2 rounded-lg border p-4 opacity-50">
                    <FormControl>
                      <RadioGroupItem
                        value="ONLINE"
                        className="hidden"
                        disabled
                      />
                    </FormControl>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCardIcon className="size-4" />
                      Online Payment (Soon)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          name="addressId"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet>
              <FieldLegend>Address</FieldLegend>
              {addresses?.length === 0 ? (
                <Empty className="gap-2">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconHomeOff />
                    </EmptyMedia>
                  </EmptyHeader>
                  <EmptyTitle className="text-lg font-medium tracking-tight">
                    No addresses found
                  </EmptyTitle>
                  <EmptyDescription className="max-w-sm">
                    You haven&apos;t added any addresses yet. Please add an
                    address to proceed with your order.
                  </EmptyDescription>
                  <EmptyContent>
                    <AddAddressDrawerDialog
                      onSuccess={(id: number) => {
                        form.setValue("addressId", id);
                      }}
                    >
                      <Button variant="ghost" type="button">
                        <IconHomePlus />
                        Add Address
                      </Button>
                    </AddAddressDrawerDialog>
                  </EmptyContent>
                </Empty>
              ) : (
                <>
                  <RadioGroup
                    name={field.name}
                    value={field.value.toString()}
                    onValueChange={field.onChange}
                  >
                    {addresses?.map((address) => (
                      <FieldLabel
                        key={address.id}
                        htmlFor={`form-rhf-radiogroup-${address.id}`}
                      >
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldContent>
                            <FieldTitle>
                              {address.fullName} - {address.phoneNumber}
                            </FieldTitle>
                            <FieldDescription>
                              {address.address}
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value={address.id.toString()}
                            id={`form-rhf-radiogroup-${address.id}`}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </>
              )}
            </FieldSet>
          )}
        />
      </form>
    </Form>
  );
}

function CheckoutFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="rounded-lg border p-4 opacity-50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div className="flex items-start justify-between" key={i}>
            <div className="space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-80" />
            </div>
            <Skeleton className="mt-1 h-4 w-4 rounded-full" />
          </div>
        ))}

        <div className="ml-auto w-fit">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  );
}
