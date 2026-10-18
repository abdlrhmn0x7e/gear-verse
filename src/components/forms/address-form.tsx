"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormItem,
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
import {
  addressGovernoratesEnum,
  createAddressInputSchema,
} from "~/lib/schemas/entities";
import { cn } from "~/lib/utils";
import { humanizeString } from "~/lib/utils/humanize-string";

const addressFormSchema = createAddressInputSchema;
export type AddressFormValues = z.infer<typeof addressFormSchema>;

// fields reach the 44px touch minimum on phones and keep the compact height with a mouse
const touchField = "pointer-coarse:h-11";

export function AddressForm({
  onSubmit,
  className,
}: {
  onSubmit: (values: AddressFormValues) => void;
  className?: string;
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      city: "",
      address: "",
      buildingNameOrNumber: "",
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
        id="address-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        <p className="text-muted-foreground text-sm text-pretty">
          Write it in Arabic or English, whichever is easier.
        </p>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  dir="auto"
                  placeholder="e.g. Ahmed Mostafa"
                  className={touchField}
                  {...field}
                />
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
              <FormLabel>Mobile number</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  value="🇪🇬 +20"
                  aria-label="Country code"
                  className={cn("w-24 shrink-0", touchField)}
                  disabled
                />
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="e.g. 010 1234 5678"
                    className={touchField}
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription>
                We&apos;ll call or WhatsApp you on it to confirm your order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="governorate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Governorate</FormLabel>
              {/* starts empty: a preset governorate is easy to miss, and it decides the shipping fee */}
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger
                    className="w-full pointer-coarse:data-[size=default]:h-11"
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder="Select a governorate" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City or area</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-level2"
                  dir="auto"
                  placeholder="e.g. Nasr City"
                  className={touchField}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street address</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-line1"
                  dir="auto"
                  placeholder="e.g. 15 Abbas El Akkad St"
                  className={touchField}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="buildingNameOrNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building, floor and apartment</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-line2"
                  dir="auto"
                  placeholder="e.g. Building 12, floor 3, apt 5"
                  className={touchField}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
