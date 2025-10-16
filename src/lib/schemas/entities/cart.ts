import z from "zod";

export const cartItemSchema = z.object({
  id: z.number(),

  cartId: z.number(),
  productId: z.number(),
  productVariantId: z.number().nullable(),
  quantity: z.number(),

  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const newCartItemSchema = cartItemSchema.omit({
  id: true,
  cartId: true,
  quantity: true,
  createdAt: true,
  updatedAt: true,
});
export type NewCartItem = z.infer<typeof newCartItemSchema>;
