import z from "zod";
import { addressSchema } from "./address";
import { phoneNumberSchema } from "./phone-number";

export const orderSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  paymentMethod: z.enum(["COD"]),
  totalAmount: z
    .number("Total amount must be a number")
    .nonnegative("Total amount must be positive"),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),

  phoneNumber: phoneNumberSchema,
  address: addressSchema,

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
