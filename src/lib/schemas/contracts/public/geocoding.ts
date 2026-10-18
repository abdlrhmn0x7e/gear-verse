import z from "zod";
import {
  addressGovernoratesEnum,
  latitudeSchema,
  longitudeSchema,
} from "../../entities/address";

export const reverseGeocodeInputSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});
export type ReverseGeocodeInput = z.infer<typeof reverseGeocodeInputSchema>;

export const reverseGeocodeResultSchema = z.object({
  governorate: addressGovernoratesEnum.nullable(),
  city: z.string().nullable(),
  street: z.string().nullable(),
});
export type ReverseGeocodeResult = z.infer<typeof reverseGeocodeResultSchema>;
