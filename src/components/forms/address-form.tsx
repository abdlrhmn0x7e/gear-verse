"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  ADDRESS_ERRORS,
  type AddressGovernoratesEnum,
  addressGovernoratesEnum,
  createAddressInputSchema,
} from "~/lib/schemas/entities";
import { PHONE_NUMBER_ERRORS } from "~/lib/schemas/phone-number";
import { SHIPPING_RATES } from "~/lib/shipping-rates";
import { formatCurrency } from "~/lib/utils/format-currency";
import { cn } from "~/lib/utils";
import type { ReverseGeocodeResult } from "~/lib/schemas/contracts/public/geocoding";
import { useLocale, useTranslations } from "next-intl";
import { LocationField } from "./address-location/location-field";
import type { Coordinates } from "./address-location/types";

const addressFormSchema = createAddressInputSchema;
export type AddressFormValues = z.infer<typeof addressFormSchema>;
const resolveAddress = zodResolver(addressFormSchema);

// the schema keeps the server's English messages; each maps back to the key the customer reads it under
const ERRORS = { ...ADDRESS_ERRORS, ...PHONE_NUMBER_ERRORS };
const ERROR_KEYS = new Map(
  Object.entries(ERRORS).map(([key, message]) => [
    message as string,
    key as keyof typeof ERRORS,
  ]),
);

// fields reach the 44px touch minimum on phones and keep the compact height with a mouse
const touchField = "pointer-coarse:h-11";
type PrefillField = "governorate" | "city" | "address";

export function AddressForm({
  id = "address-form",
  onSubmit,
  onGovernorateChange,
  className,
}: {
  id?: string;
  onSubmit: (values: AddressFormValues) => void;
  onGovernorateChange?: (
    governorate: AddressGovernoratesEnum | undefined,
  ) => void;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("checkout.addressForm");
  const tGovernorates = useTranslations("checkout.governorates");
  const form = useForm<AddressFormValues>({
    resolver: async (...args) => {
      const result = await resolveAddress(...args);
      for (const error of Object.values(result.errors)) {
        const key = ERROR_KEYS.get(String(error?.message));
        if (error && key) error.message = t(`errors.${key}`);
      }
      return result;
    },
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      city: "",
      address: "",
      buildingNameOrNumber: "",
      latitude: null,
      longitude: null,
    },
  });

  const [latitude, longitude, governorate] = useWatch({
    control: form.control,
    name: ["latitude", "longitude", "governorate"],
  });
  useEffect(() => {
    onGovernorateChange?.(governorate);
  }, [governorate, onGovernorateChange]);

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
      addressGovernoratesEnum.options
        .map((governorate) => ({
          label: tGovernorates(governorate),
          value: governorate,
        }))
        // alphabetical in the visitor's language; English keeps the enum's order
        .sort((a, b) => a.label.localeCompare(b.label, locale)),
    [tGovernorates, locale],
  );

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        <p className="text-muted-foreground text-sm text-pretty">
          {t("languageHint")}
        </p>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fullName")}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  dir="auto"
                  placeholder={t("fullNamePlaceholder")}
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
              <FormLabel>{t("phone")}</FormLabel>
              {/* a phone number reads left to right, country code first, in Arabic too */}
              <div className="flex items-center gap-2" dir="ltr">
                <Input
                  value="🇪🇬 +20"
                  aria-label={t("countryCode")}
                  className={cn("w-24 shrink-0", touchField)}
                  disabled
                />
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={t("phonePlaceholder")}
                    className={touchField}
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription>{t("phoneHint")}</FormDescription>
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
              <FormLabel>{t("governorate")}</FormLabel>
              {/* starts empty: a preset governorate is easy to miss, and it decides the shipping fee */}
              <Select
                items={governorates}
                onValueChange={field.onChange}
                value={field.value ?? null}
              >
                <FormControl>
                  <SelectTrigger
                    className="w-full pointer-coarse:data-[size=default]:h-11"
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder={t("governoratePlaceholder")} />
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
              {governorate && (
                <FormDescription>
                  {t("shippingFee", {
                    governorate: tGovernorates(governorate),
                    price: formatCurrency(SHIPPING_RATES[governorate], locale),
                  })}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("city")}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-level2"
                  dir="auto"
                  placeholder={t("cityPlaceholder")}
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
              <FormLabel>{t("street")}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-line1"
                  dir="auto"
                  placeholder={t("streetPlaceholder")}
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
              <FormLabel>{t("building")}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-line2"
                  dir="auto"
                  placeholder={t("buildingPlaceholder")}
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
