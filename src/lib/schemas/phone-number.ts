import z from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const INVALID_MESSAGE = "Enter an Egyptian mobile number, like 010 1234 5678";

// 010 Vodafone, 011 Etisalat (e&), 012 Orange, 015 WE; landlines can't take the courier's calls or WhatsApp
const EGYPTIAN_MOBILE = /^1[0125]\d{8}$/;

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform((val, ctx) => {
    // the non-throwing parser: a thrown error escapes the resolver and the submit fails silently
    const phone = parsePhoneNumberFromString(val, { defaultCountry: "EG" });
    if (
      !phone?.isValid() ||
      phone.country !== "EG" ||
      !EGYPTIAN_MOBILE.test(phone.nationalNumber)
    ) {
      ctx.addIssue({ code: "custom", message: INVALID_MESSAGE });
      return z.NEVER;
    }
    return String(phone.number);
  });
