import z from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

/** What the server answers in; the storefront form shows each one translated under its key (checkout.addressForm.errors). */
export const PHONE_NUMBER_ERRORS = {
  phoneRequired: "Phone number is required",
  phoneInvalid: "Enter an Egyptian mobile number, like 010 1234 5678",
} as const;

// 010 Vodafone, 011 Etisalat (e&), 012 Orange, 015 WE; landlines can't take the courier's calls or WhatsApp
const EGYPTIAN_MOBILE = /^1[0125]\d{8}$/;

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, PHONE_NUMBER_ERRORS.phoneRequired)
  .transform((val, ctx) => {
    // the non-throwing parser: a thrown error escapes the resolver and the submit fails silently
    const phone = parsePhoneNumberFromString(val, { defaultCountry: "EG" });
    if (
      !phone?.isValid() ||
      phone.country !== "EG" ||
      !EGYPTIAN_MOBILE.test(phone.nationalNumber)
    ) {
      ctx.addIssue({
        code: "custom",
        message: PHONE_NUMBER_ERRORS.phoneInvalid,
      });
      return z.NEVER;
    }
    return String(phone.number);
  });
