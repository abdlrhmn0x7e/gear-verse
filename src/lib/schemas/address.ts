import z from "zod";

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

export const addressSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  governorate: addressGovernoratesEnum,

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
