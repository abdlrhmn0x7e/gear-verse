"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Skeleton } from "~/components/ui/skeleton";

import { IconHomePlus } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { PayOnDelivery } from "~/components/features/payment/pay-on-delivery";
import {
  checkoutInputSchema,
  type CompleteCheckoutInput,
} from "~/lib/schemas/contracts/public/checkout";
import { useTRPC } from "~/trpc/client";
import { AddAddressDrawerDialog } from "./add-address-drawer-dialog";
import { DeleteAddressDialog } from "./delete-address-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressForm } from "~/components/forms/address-form";

const checkoutFormSchema = checkoutInputSchema;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm({
  onSubmit,
}: {
  onSubmit: (data: CompleteCheckoutInput) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: addresses, isPending: addressesPending } = useQuery(
    trpc.public.checkout.queries.getAddresses.queryOptions(),
  );

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: async () => {
      const addresses = await queryClient.fetchQuery(
        trpc.public.checkout.queries.getAddresses.queryOptions(),
      );

      return {
        paymentMethod: "COD",
        addressId: addresses[0]?.id ?? 0,
      };
    },
  });

  if (form.formState.isLoading || addressesPending) {
    return <CheckoutFormSkeleton />;
  }

  function selectAddress(id: number) {
    form.setValue("addressId", id, { shouldValidate: true });
  }

  function handleAddressDeleted(id: number) {
    if (form.getValues("addressId") !== id) return;
    // with none left the list gives way to the first-address form
    const next = addresses?.find((address) => address.id !== id);
    form.setValue("addressId", next?.id ?? 0);
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="checkout-address-heading" className="space-y-4">
        <h2
          id="checkout-address-heading"
          className="text-lg font-medium md:text-xl"
        >
          Delivery address
        </h2>

        {addresses?.length === 0 ? (
          <div className="bg-card rounded-3xl p-5 sm:p-6">
            {/* takes the checkout form's id, so place order saves the address with the order */}
            <AddressForm
              id="checkout-form"
              onSubmit={(address) =>
                onSubmit({
                  paymentMethod: form.getValues("paymentMethod"),
                  address,
                })
              }
            />
          </div>
        ) : (
          <>
            <form
              id="checkout-form"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <Controller
                name="addressId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FieldSet>
                    <RadioGroup
                      name={field.name}
                      value={field.value.toString()}
                      onValueChange={field.onChange}
                      aria-labelledby="checkout-address-heading"
                    >
                      {addresses?.map((address) => (
                        // the delete button sits over the row, not in it: a label can't hold a second control
                        <div key={address.id} className="relative">
                          <FieldLabel
                            htmlFor={`form-rhf-radiogroup-${address.id}`}
                            className="*:data-[slot=field]:pe-14"
                          >
                            <Field
                              orientation="horizontal"
                              data-invalid={fieldState.invalid}
                            >
                              <FieldContent>
                                {/* names and streets are often Arabic; isolating each keeps the phone number in place */}
                                <FieldTitle>
                                  <bdi>{address.fullName}</bdi> ·{" "}
                                  <bdi dir="ltr">{address.phoneNumber}</bdi>
                                </FieldTitle>
                                <FieldDescription dir="auto">
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
                          <DeleteAddressDialog
                            address={address}
                            onDeleted={handleAddressDeleted}
                            className="text-muted-foreground absolute end-3 top-1/2 -translate-y-1/2"
                          />
                        </div>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldSet>
                )}
              />
            </form>

            {/* outside the checkout form: React bubbles the drawer form's submit through the portal */}
            <AddAddressDrawerDialog onSuccess={selectAddress}>
              <Button
                type="button"
                variant="outline"
                className="pointer-coarse:h-11"
              >
                <IconHomePlus data-icon="inline-start" />
                Add another address
              </Button>
            </AddAddressDrawerDialog>
          </>
        )}
      </section>

      <section aria-labelledby="checkout-payment-heading" className="space-y-3">
        <h2
          id="checkout-payment-heading"
          className="text-lg font-medium md:text-xl"
        >
          Payment
        </h2>
        <PayOnDelivery
          label="Cash on delivery"
          note="We'll confirm your shipping fee on WhatsApp; you prepay it by InstaPay or wallet, and the rest on delivery."
        />
      </section>
    </div>
  );
}

export function CheckoutFormSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-input-background flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-64 max-w-full" />
                <Skeleton className="h-3 w-80 max-w-full" />
              </div>
              <Skeleton className="mt-1 h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-11 w-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
