import z from "zod";
import { addressEntitySchema } from "./address";
import { phoneNumberSchema } from "../phone-number";

export const orderEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  paymentMethod: z.enum(["COD"]),
  totalAmount: z
    .number("Total amount must be a number")
    .nonnegative("Total amount must be positive"),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),

  phoneNumber: phoneNumberSchema,
  address: addressEntitySchema,

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
