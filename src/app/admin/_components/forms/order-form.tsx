import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteIcon, CreditCardIcon, TrashIcon } from "lucide-react";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { addressGovernoratesEnum } from "~/lib/schemas/entities/address";
import { phoneNumberSchema } from "~/lib/schemas/phone-number";
import { humanizeString } from "~/lib/utils/humanize-string";
import { cn } from "~/lib/utils";
import { ProductVariantsCombobox } from "../inputs/product-variants-combobox";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { OrderStatus } from "../tables/orders/order-status";

const orderFormSchema = z.object({
  userId: z.number({ message: "User is required" }),
  phoneNumber: phoneNumberSchema,
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"], {
    message: "Status is required",
  }),
  paymentMethod: z.enum(["COD"], { message: "Payment method is required" }),
  address: z.object({
    address: z.string({ message: "Address is required" }).min(1),
    city: z.string({ message: "City is required" }).min(1),
    governorate: addressGovernoratesEnum,
  }),
  items: z
    .array(
      z.object({
        productVariantId: z.number({ message: "Variant is required" }),
        quantity: z
          .number({ message: "Quantity is required" })
          .int("Quantity must be an integer")
          .min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "Add at least one item"),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export function OrderForm({
  formId,
  isBusy,
  onSubmit,
}: {
  formId: string;
  isBusy: boolean;
  onSubmit: (values: OrderFormValues) => void;
}) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paymentMethod: "COD",
      status: "PENDING",
      phoneNumber: "",
      address: {
        address: "",
        city: "",
        governorate: addressGovernoratesEnum.enum.CAIRO,
      },
      items: [{ productVariantId: 0, quantity: 1 }],
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

  const governorates = useMemo(
    () =>
      addressGovernoratesEnum.options.map((governorate) => ({
        label: humanizeString(governorate, "snake"),
        value: governorate,
      })),
    [],
  );

  function handleAddItem() {
    appendItem({ productVariantId: 0, quantity: 1 });
  }

  function handleRemoveItem(index: number) {
    removeItem(index);
  }

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={(event) => {
          event.stopPropagation();
          void form.handleSubmit(onSubmit)(event);
        }}
        className={cn("space-y-4", isBusy && "pointer-events-none opacity-75")}
      >
        <div className="scroll-shadow max-h-[calc(70svh-10rem)] space-y-6 overflow-y-auto pt-2 pr-2 pb-12 pl-1">
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
                    <FormItem className="has-checked:dark:bg-primary/50 has-checked:bg-primary/90 has-checked:border-primary has-checked:text-primary-foreground flex items-center gap-2 rounded-lg border p-4">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="01000000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "PENDING",
                            "SHIPPED",
                            "DELIVERED",
                            "REFUNDED",
                            "CANCELLED",
                          ] as const
                        ).map((status) => (
                          <SelectItem key={status} value={status}>
                            <OrderStatus status={status} variant="plain" />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address.governorate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Governorate</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates.map((governorate) => (
                        <SelectItem
                          key={governorate.value}
                          value={governorate.value}
                        >
                          {governorate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nasr City" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-lg font-medium">Items</FormLabel>
              <Button type="button" variant="outline" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {itemFields.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                  <span className="text-2xl">🛒</span>
                  <span className="font-medium">No items added yet.</span>
                  <span className="text-sm">
                    Click &quot;Add Item&quot; to add your first item.
                  </span>
                </div>
              ) : (
                itemFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-end"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.productVariantId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Product Variant</FormLabel>
                          <FormControl>
                            <ProductVariantsCombobox
                              value={field.value || 0}
                              onValueChange={(value) => field.onChange(value)}
                              isModal
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-full md:w-32">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="destructiveGhost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <FormMessage>{form.formState.errors.items?.message}</FormMessage>
          </div>
        </div>
      </form>
    </Form>
  );
}
