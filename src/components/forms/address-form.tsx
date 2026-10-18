"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import type { ReverseGeocodeResult } from "~/lib/schemas/contracts/public/geocoding";
import { humanizeString } from "~/lib/utils/humanize-string";
import { LocationField } from "./address-location/location-field";
import type { Coordinates } from "./address-location/types";

const addressFormSchema = createAddressInputSchema;
export type AddressFormValues = z.infer<typeof addressFormSchema>;

type PrefillField = "governorate" | "city" | "address";

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
      latitude: null,
      longitude: null,
    },
  });

  const [latitude, longitude] = useWatch({
    control: form.control,
    name: ["latitude", "longitude"],
  });
  const pin: Coordinates | null =
    latitude != null && longitude != null ? { latitude, longitude } : null;

  // what the pin last filled in, so moving the pin can refresh its own
  // guesses without touching anything the customer typed
  const prefilled = useRef<Partial<Record<PrefillField, string>>>({});

  function handlePinChange(coordinates: Coordinates | null) {
    form.setValue("latitude", coordinates?.latitude ?? null, {
      shouldDirty: true,
    });
    form.setValue("longitude", coordinates?.longitude ?? null, {
      shouldDirty: true,
    });
  }

  function canPrefill(field: PrefillField) {
    const current = form.getValues(field);
    return (
      current === "" ||
      current === prefilled.current[field] ||
      // the governorate starts on Cairo rather than empty
      (field === "governorate" && !form.getFieldState(field).isDirty)
    );
  }

  function handleAddressFound({
    governorate,
    city,
    street,
  }: ReverseGeocodeResult) {
    const options = (field: PrefillField) => ({
      shouldValidate: !!form.formState.errors[field],
    });

    if (governorate && canPrefill("governorate")) {
      form.setValue("governorate", governorate, options("governorate"));
      prefilled.current.governorate = governorate;
    }
    if (city && canPrefill("city")) {
      form.setValue("city", city, options("city"));
      prefilled.current.city = city;
    }
    if (street && canPrefill("address")) {
      form.setValue("address", street, options("address"));
      prefilled.current.address = street;
    }
  }

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

        <LocationField
          value={pin}
          onChange={handlePinChange}
          onAddressFound={handleAddressFound}
        />

        <FormField
          control={form.control}
          name="governorate"
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

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input dir="auto" placeholder="Nasr City" {...field} />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input dir="auto" placeholder="123 Main St" {...field} />
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
              <FormLabel>Building Name/Number</FormLabel>
              <FormControl>
                <Input
                  dir="auto"
                  placeholder="Building 12, floor 3, apt 5"
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
