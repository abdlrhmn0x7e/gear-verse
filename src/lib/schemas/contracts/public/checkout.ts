import z from "zod";
import { createAddressInputSchema } from "../../entities/address";

const paymentMethodSchema = z.enum(["COD"]);
/** required when any line is short on stock and its product takes backorders */
const acknowledgeBackorderSchema = z.boolean().optional();

export const checkoutInputSchema = z.object({
  paymentMethod: paymentMethodSchema,
  acknowledgeBackorder: acknowledgeBackorderSchema,
  addressId: z.coerce
    .number<number>("Address ID must be a number")
    .positive("Please select a valid address"),
});
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

/** A first-time customer places the order with the address they just typed, saved alongside it. */
export const checkoutWithNewAddressInputSchema = z.object({
  paymentMethod: paymentMethodSchema,
  acknowledgeBackorder: acknowledgeBackorderSchema,
  address: createAddressInputSchema,
});

export const completeCheckoutInputSchema = z.union([
  checkoutInputSchema,
  checkoutWithNewAddressInputSchema,
]);
export type CompleteCheckoutInput = z.infer<typeof completeCheckoutInputSchema>;

export const deleteAddressInputSchema = z.object({
  id: z.number().positive(),
});
