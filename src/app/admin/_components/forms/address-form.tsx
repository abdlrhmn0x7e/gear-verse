"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Form,
  FormControl,
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
import { humanizeString } from "~/lib/utils/humanize-string";

const addressFormSchema = createAddressInputSchema;
export type AddressFormValues = z.infer<typeof addressFormSchema>;

export function AddressForm({
  onSubmit,
}: {
  onSubmit: (values: AddressFormValues) => void;
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      governorate: addressGovernoratesEnum.enum.CAIRO,
      city: "",
      address: "",
      buildingNameOrNumber: "",
      floor: "",
      apartment: "",
      additionalDetails: "",
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
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Mohammed Khamis" {...field} />
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
          name="governorate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Governorate</FormLabel>
              <FormControl>
                <Select
                  items={governorates}
                  onValueChange={field.onChange}
                  value={field.value}
                >
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

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Nasr City" {...field} />
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
              <FormLabel>Street name or number</FormLabel>
              <FormControl>
                <Input placeholder="15 Abbas El Akkad St" {...field} />
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
              <FormLabel>Building number</FormLabel>
              <FormControl>
                <Input placeholder="12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="3" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="5" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additionalDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Landmark or directions (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Next to the pharmacy, gate 2"
                  {...field}
                  value={field.value ?? ""}
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
