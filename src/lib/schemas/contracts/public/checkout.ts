import z from "zod";

export const checkoutInputSchema = z.object({
  paymentMethod: z.enum(["COD"]),
  addressId: z.number().positive(),
});
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
