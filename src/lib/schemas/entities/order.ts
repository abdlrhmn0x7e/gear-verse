import z from "zod";

export const orderStatusEnum = z.enum([
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const orderEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  paymentMethod: z.enum(["COD", "ONLINE"]),
  status: orderStatusEnum,
  userId: z
    .number("User ID must be a number")
    .positive("User ID must be positive"),
  addressId: z
    .number("Address ID must be a number")
    .positive("Address is required"),

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
  id: z
    .number("ID must be a number")
    .positive("ID is required and must be positive"),

  orderId: z
    .number("Order ID must be a number")
    .positive("Order ID must be positive"),
  productId: z
    .number("Product ID must be a number")
    .positive("Product ID must be positive"),
  productVariantId: z
    .number("Product variant ID must be a number")
    .positive("Product variant ID must be positive")
    .nullable(),
  quantity: z.coerce
    .number<number>("Quantity must be a number")
    .positive("Quantity must be positive"),

  createdAt: z.coerce.date("Created at must be a date"),
  updatedAt: z.coerce.date("Updated at must be a date"),
});
export type OrderItem = z.infer<typeof orderItemEntitySchema>;

export const createOrderItemInputSchema = orderItemEntitySchema.omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateOrderItemInput = z.infer<typeof createOrderItemInputSchema>;

export const createFullOrderInputSchema = createOrderInputSchema.extend({
  items: z.array(createOrderItemInputSchema),
});
export type CreateFullOrderInput = z.infer<typeof createFullOrderInputSchema>;

export const updateFullOrderInputSchema = createFullOrderInputSchema.partial();
export type UpdateFullOrderInput = z.infer<typeof updateFullOrderInputSchema>;
