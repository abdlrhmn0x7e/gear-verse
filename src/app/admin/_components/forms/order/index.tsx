"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconPackageOff } from "@tabler/icons-react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
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
import { NumberInput } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Skeleton } from "~/components/ui/skeleton";
import { createFullOrderInputSchema } from "~/lib/schemas/entities";
import { AddressesCombobox } from "./addresses-combobox";
import { CustomersCombobox, type CustomerOption } from "./customers-combobox";
import { ProductsCombobox, type ProductOption } from "./products-combobox";
import { getDirtyFields } from "~/lib/utils/get-dirty-fields";

const itemsSchema = z.array(
  createFullOrderInputSchema.shape.items.element.extend({
    productId: z.number().positive("Choose a product."),
    quantity: z.coerce.number<number>().positive("Enter 1 or more."),
  }),
);
const baseOrderFormSchema = createFullOrderInputSchema.extend({
  userId: z.number().positive("Choose a customer."),
  addressId: z.number().positive("Choose an address."),
});

// the server rejects an order without items, so say so before it's sent
const createOrderFormSchema = baseOrderFormSchema.extend({
  items: itemsSchema.min(1, "Add at least one item to the order."),
});
const editOrderFormSchema = baseOrderFormSchema.extend({
  items: itemsSchema.min(
    1,
    "An order needs at least one item. Cancel the order instead.",
  ),
});
export type OrderFormValues = z.infer<typeof createOrderFormSchema>;

const PAYMENT_METHODS = [
  {
    id: "COD",
    title: "Cash on delivery",
    description: "Paid when the order arrives.",
    disabled: false,
  },
  {
    id: "ONLINE",
    title: "Online payment",
    description: "Coming soon.",
    disabled: true,
  },
] as const;

/** The quantity column and the remove button, shared by the column labels and every row so they line up */
const QUANTITY_COLUMN = "w-20 shrink-0 sm:w-24";
const REMOVE_COLUMN = "size-9 shrink-0";

export function OrderForm({
  onSubmit,
  onEdit,
  defaultValues,
  selected,
}: {
  onSubmit?: (values: OrderFormValues) => void;
  onEdit?: (values: Partial<OrderFormValues>) => void;
  defaultValues?: Partial<OrderFormValues>;
  /** How the order's current customer and items read, for the pickers that page through the full lists */
  selected?: {
    customer?: CustomerOption | null;
    items?: ProductOption[];
  };
}) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(
      defaultValues ? editOrderFormSchema : createOrderFormSchema,
    ),
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
  });

  const itemsError = form.formState.errors.items;

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
      className="flex flex-col gap-8"
    >
      <FieldSet className="min-w-0 gap-5">
        <FieldLegend>Customer</FieldLegend>
        <FieldGroup className="gap-5">
          <Controller
            name="userId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor="order-customer">Name</FieldLabel>
                <CustomersCombobox
                  id="order-customer"
                  value={field.value}
                  onValueChange={field.onChange}
                  selected={selected?.customer}
                  aria-invalid={fieldState.invalid}
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
              <Field data-invalid={fieldState.invalid} className="gap-2">
                <FieldLabel htmlFor="order-address">
                  Shipping address
                </FieldLabel>
                <AddressesCombobox
                  id="order-address"
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

      {/* A legend can't share a row with the button (browsers lay it out apart from the set's content), so it names
          the set for assistive tech and a look-alike heading sits beside the button. min-w-0 because a fieldset is
          otherwise as wide as its content, and a long product name pushed the row out of the drawer */}
      <FieldSet className="min-w-0 gap-2">
        <FieldLegend className="sr-only">Items</FieldLegend>
        <div className="-mt-1 mb-1 flex items-center justify-between gap-4">
          <p aria-hidden className="text-base font-medium">
            Items
          </p>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleAddItem}
          >
            <PlusIcon data-icon="inline-start" />
            Add item
          </Button>
        </div>

        {itemFields.length > 0 ? (
          <>
            <div
              aria-hidden
              className="text-muted-foreground flex gap-2 text-xs font-medium"
            >
              <span className="flex-1">Product</span>
              <span className={QUANTITY_COLUMN}>Quantity</span>
              <span className={REMOVE_COLUMN} />
            </div>

            <ul className="flex flex-col gap-2">
              {itemFields.map((itemField, index) => (
                <li key={itemField.id} className="flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <Controller
                      name={`items.${index}`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="min-w-0 flex-1 gap-0"
                        >
                          <FieldLabel
                            htmlFor={`order-item-${index}-product`}
                            className="sr-only"
                          >
                            Item {index + 1} product
                          </FieldLabel>
                          <ProductsCombobox
                            id={`order-item-${index}-product`}
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
                            selected={selected?.items?.find(
                              (item) =>
                                item.productId === field.value.productId &&
                                item.productVariantId ===
                                  (field.value.productVariantId ?? null),
                            )}
                            ariaInvalid={!!itemsError?.[index]?.productId}
                          />
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({
                        field: { onChange, ...field },
                        fieldState,
                      }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className={`gap-0 ${QUANTITY_COLUMN}`}
                        >
                          <FieldLabel htmlFor={field.name} className="sr-only">
                            Item {index + 1} quantity
                          </FieldLabel>
                          <NumberInput
                            {...field}
                            onValueChange={onChange}
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            placeholder="1"
                          />
                        </Field>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive-ghost"
                      size="icon"
                      aria-label={`Remove item ${index + 1}`}
                      className={REMOVE_COLUMN}
                      onClick={() => removeItem(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  <FieldError
                    errors={[
                      itemsError?.[index]?.productId,
                      itemsError?.[index]?.quantity,
                    ]}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-muted-foreground flex items-center gap-3 rounded-2xl border border-dashed px-4 py-3 text-sm">
            <IconPackageOff className="size-5 shrink-0" aria-hidden />
            No items yet. Add the products this order ships.
          </div>
        )}
        <FieldError errors={[itemsError?.root ?? itemsError]} />
      </FieldSet>

      <Controller
        name="paymentMethod"
        control={form.control}
        render={({ field, fieldState }) => (
          <FieldSet className="min-w-0 gap-2">
            <FieldLegend>Payment</FieldLegend>
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
            >
              {PAYMENT_METHODS.map((paymentMethod) => (
                <FieldLabel
                  key={paymentMethod.id}
                  htmlFor={`order-payment-${paymentMethod.id}`}
                  // the plum edge and tint mark the choice on the white drawer, where the default tint barely shows
                  className="has-data-checked:border-primary has-data-checked:bg-brand-subtle/60 dark:has-data-checked:bg-brand-subtle"
                >
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                    data-disabled={paymentMethod.disabled}
                  >
                    <FieldContent>
                      <FieldTitle>{paymentMethod.title}</FieldTitle>
                      <FieldDescription>
                        {paymentMethod.description}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={paymentMethod.id}
                      id={`order-payment-${paymentMethod.id}`}
                      aria-invalid={fieldState.invalid}
                      disabled={paymentMethod.disabled}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />
    </form>
  );
}

export function OrderFormSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <FieldSet className="gap-5">
        <FieldLegend>Customer</FieldLegend>
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </FieldSet>

      <FieldSet className="gap-2">
        <div className="-mt-1 mb-1 flex items-center justify-between gap-4">
          <p className="text-base font-medium">Items</p>
          <Skeleton className="h-8 w-26 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full max-w-40" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className={`h-10 rounded-xl ${QUANTITY_COLUMN}`} />
            <Skeleton className={`rounded-full ${REMOVE_COLUMN}`} />
          </div>
        ))}
      </FieldSet>

      <FieldSet className="gap-2">
        <FieldLegend>Payment</FieldLegend>
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-[74px] rounded-2xl" />
          <Skeleton className="h-[74px] rounded-2xl" />
        </div>
      </FieldSet>
    </div>
  );
}
