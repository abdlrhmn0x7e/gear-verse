import z from "zod";

export const checkoutInputSchema = z.object({
  paymentMethod: z.enum(["COD"]),
  addressId: z.coerce
    .number<number>("Address ID must be a number")
    .positive("Please select a valid address"),
});
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
