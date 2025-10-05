import z from "zod";

export const orderEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  paymentMethod: z.enum(["COD"]),
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"]),
  addressId: z.number().positive(),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
export type Order = z.infer<typeof orderEntitySchema>;

export const createOrderInputSchema = orderEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const updateOrderInputSchema = orderEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateOrderInput = z.infer<typeof updateOrderInputSchema>;

export const orderItemEntitySchema = z.object({
  id: z.number().positive(),

  orderId: z.number().positive(),
  productVariantId: z.number().positive(),
  quantity: z.number().positive(),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
export type OrderItem = z.infer<typeof orderItemEntitySchema>;

export const createOrderItemInputSchema = orderItemEntitySchema.omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateOrderItemInput = z.infer<typeof createOrderItemInputSchema>;
