import z from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val) =>
    String(parsePhoneNumberWithError(val, { defaultCountry: "EG" }).number),
  )
  .refine(
    (val) => parsePhoneNumberWithError(val, { defaultCountry: "EG" }).isValid(),
    "Phone number must be a valid Egyptian phone number",
  );
