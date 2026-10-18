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
import { checkoutInputSchema } from "~/lib/schemas/contracts/public/checkout";
import { useTRPC } from "~/trpc/client";
import {
  AddAddressDrawerDialog,
  AddAddressInline,
} from "./add-address-drawer-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const checkoutFormSchema = checkoutInputSchema;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm({
  onSubmit,
}: {
  onSubmit: (data: CheckoutFormValues) => void;
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
          <AddAddressInline onSuccess={selectAddress} />
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
                        <FieldLabel
                          key={address.id}
                          htmlFor={`form-rhf-radiogroup-${address.id}`}
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
