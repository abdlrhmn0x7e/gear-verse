"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteIcon, CreditCardIcon } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { addressGovernoratesEnum } from "~/lib/schemas/address";
import { phoneNumberSchema } from "~/lib/schemas/phone-number";
import { cn } from "~/lib/utils";
import { humanizeString } from "~/lib/utils/humanize-string";

const checkoutFormSchema = z.object({
  paymentMethod: z.enum(["COD"], "Payment method is required"),
  phoneNumber: phoneNumberSchema,
  address: z.object({
    address: z.string("Address is required").min(1, "Address is required"),
    city: z.string("City is required").min(1, "City is required"),
    governorate: addressGovernoratesEnum,
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm({
  defaultValues,
  onSubmit,
  disabled,
}: {
  onSubmit: (data: CheckoutFormValues) => void;
  defaultValues?: Partial<CheckoutFormValues>;
  disabled?: boolean;
}) {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      paymentMethod: "COD",
      phoneNumber: "",
      address: defaultValues?.address ?? {
        address: "",
        city: "",
        governorate: "CAIRO",
      },
    },
  });
  const governorates = useMemo(
    () =>
      addressGovernoratesEnum.options.map((governorate) => ({
        label: humanizeString(governorate, "snake"),
        value: governorate,
      })),
    [],
  );

  return (
    <Form {...form}>
      <form
        id="checkout-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "space-y-4",
          disabled && "pointer-events-none opacity-50 transition-opacity",
        )}
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

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <div className="flex items-center gap-2">
                <Input value="🇪🇬 +20" className="w-24 shrink-0" disabled />
                <FormControl>
                  <Input {...field} placeholder="01010101010" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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
      </form>
    </Form>
  );
}
