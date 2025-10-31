"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceGamepad, IconPackageOff } from "@tabler/icons-react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import {
  Empty,
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
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { NumberInput } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { createFullOrderInputSchema } from "~/lib/schemas/entities";
import { AddressesCombobox } from "./addresses-combobox";
import { CustomersCombobox } from "./customers-combobox";
import { ProductsCombobox } from "./products-combobox";
import { getDirtyFields } from "~/lib/utils/get-dirty-fields";

const orderFormSchema = createFullOrderInputSchema;
export type OrderFormValues = z.infer<typeof orderFormSchema>;

const PAYMENT_METHODS = [
  {
    id: "COD",
    title: "Cash on Delivery",
    description: "Pay when the order is delivered.",
  },
  {
    id: "ONLINE",
    title: "Online Payment",
    description: "Pay online using your credit card.",
  },
] as const;

export function OrderForm({
  onSubmit,
  onEdit,
  defaultValues,
}: {
  onSubmit?: (values: OrderFormValues) => void;
  onEdit?: (values: Partial<OrderFormValues>) => void;
  defaultValues?: Partial<OrderFormValues>;
}) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: defaultValues ?? {
      paymentMethod: "COD",
      status: "PENDING",
      userId: 0,
      addressId: 0,
      items: [],
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "items",
    rules: {
      minLength: 1,
    },
  });

  const userId = useWatch({
    control: form.control,
    name: "userId",
  });

  function handleAddItem() {
    appendItem({
      productId: 0,
      quantity: 1,
      productVariantId: null,
    });
  }

  const { dirtyFields } = form.formState;

  function handleSubmit(data: OrderFormValues) {
    if (defaultValues) {
      const _data = getDirtyFields(data, dirtyFields);

      onEdit?.(_data);
      return;
    }

    onSubmit?.(data);
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      id="order-form"
      className="space-y-8"
    >
      <Controller
        name="paymentMethod"
        control={form.control}
        render={({ field, fieldState }) => (
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              Select the payment method for the order.
            </FieldDescription>
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-2 gap-2"
            >
              {PAYMENT_METHODS.map((paymentMethod) => (
                <FieldLabel
                  key={paymentMethod.id}
                  htmlFor={`form-rhf-radiogroup-${paymentMethod.id}`}
                >
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldTitle>{paymentMethod.title}</FieldTitle>
                      <FieldDescription>
                        {paymentMethod.description}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={paymentMethod.id}
                      id={`form-rhf-radiogroup-${paymentMethod.id}`}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <FieldSet>
        <FieldLegend>Shipping Information</FieldLegend>
        <FieldDescription>
          Select or add a shipping address for this order. The chosen address
          will be used for delivery.
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="userId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="name">Customer</FieldLabel>
                <CustomersCombobox
                  value={field.value}
                  onValueChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="addressId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <AddressesCombobox
                  userId={userId}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <Frame>
        <FrameHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconDeviceGamepad className="size-6" />
              <FrameTitle className="text-lg font-medium">
                Order Items
              </FrameTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleAddItem}
            >
              <PlusIcon />
              Add Item
            </Button>
          </div>
        </FrameHeader>
        <FramePanel>
          {itemFields.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {itemFields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        name={`items.${index}`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <ProductsCombobox
                              value={{
                                id: field.value.productId,
                                variantId: field.value.productVariantId ?? null,
                              }}
                              onValueChange={(value) => {
                                field.onChange({
                                  ...field.value,
                                  productId: value.id,
                                  productVariantId: value.variantId,
                                });
                              }}
                              ariaInvalid={fieldState.invalid}
                            />
                          </Field>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <NumberInput
                              {...field}
                              id={field.name}
                              aria-invalid={fieldState.invalid}
                              placeholder="1"
                            />
                          </Field>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive-outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconPackageOff />
                </EmptyMedia>
                <EmptyTitle>No items added yet</EmptyTitle>
                <EmptyDescription>
                  Add items to the order to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </FramePanel>
      </Frame>
    </form>
  );
}
