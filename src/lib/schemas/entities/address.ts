import z from "zod";
import { phoneNumberSchema } from "../phone-number";

export const addressGovernoratesEnum = z.enum([
  "ALEXANDRIA",
  "ASWAN",
  "ASYUT",
  "BEHEIRA",
  "BENI_SUEF",
  "CAIRO",
  "DAKAHLIA",
  "DAMIETTA",
  "FAIYUM",
  "GHARBIA",
  "GIZA",
  "ISMAILIA",
  "KAFR_EL_SHEIKH",
  "LUXOR",
  "MATROUH",
  "MINYA",
  "MONUFIA",
  "NEW_VALLEY",
  "NORTH_SINAI",
  "PORT_SAID",
  "QALYUBIA",
  "QENA",
  "RED_SEA",
  "SHARQIA",
  "SOHAG",
  "SOUTH_SINAI",
  "SUEZ",
]);
export type AddressGovernoratesEnum = z.infer<typeof addressGovernoratesEnum>;

/** What the server answers in; the storefront form shows each one translated under its key (checkout.addressForm.errors). */
export const ADDRESS_ERRORS = {
  fullNameRequired: "Full name is required",
  addressRequired: "Address is required",
  buildingRequired: "Building name or number is required",
  cityRequired: "City is required",
  governorateRequired: "Select a governorate",
} as const;

export const latitudeSchema = z
  .number("Latitude must be a number")
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");
export const longitudeSchema = z
  .number("Longitude must be a number")
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

export const addressEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  fullName: z.string().min(1, ADDRESS_ERRORS.fullNameRequired),
  phoneNumber: phoneNumberSchema,
  address: z.string().min(1, ADDRESS_ERRORS.addressRequired),
  buildingNameOrNumber: z.string().min(1, ADDRESS_ERRORS.buildingRequired),
  city: z.string().min(1, ADDRESS_ERRORS.cityRequired),
  governorate: z.enum(
    addressGovernoratesEnum.options,
    ADDRESS_ERRORS.governorateRequired,
  ),
  latitude: latitudeSchema.nullable(),
  longitude: longitudeSchema.nullable(),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
export type Address = z.infer<typeof addressEntitySchema>;

/** A pinned location needs both coordinates; half a pin is no location. */
function refineCoordinatesPair(
  value: { latitude?: number | null; longitude?: number | null },
  ctx: z.RefinementCtx,
) {
  const hasLatitude = value.latitude != null;
  const hasLongitude = value.longitude != null;
  if (hasLatitude === hasLongitude) return;

  ctx.addIssue({
    code: "custom",
    message: "Pinned location needs both latitude and longitude",
    path: [hasLatitude ? "longitude" : "latitude"],
  });
}

const createAddressBaseSchema = addressEntitySchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    latitude: latitudeSchema.nullish(),
    longitude: longitudeSchema.nullish(),
  });

export const createAddressInputSchema = createAddressBaseSchema.superRefine(
  refineCoordinatesPair,
);
export type CreateAddressInput = z.infer<typeof createAddressInputSchema>;

export const updateAddressInputSchema = addressEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .superRefine(refineCoordinatesPair);
export type UpdateAddressInput = z.infer<typeof updateAddressInputSchema>;
