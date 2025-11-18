import z from "zod";
import { paginationSchema } from "../pagination";

export const ordersFilterSchema = z.object({
  phoneNumber: z.string(),
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"]),
  paymentMethod: z.enum(["COD", "ONLINE"]),
});
export type OrdersFilter = z.infer<typeof ordersFilterSchema>;

export const ordersGetPageInputSchema = paginationSchema.extend({
  filters: ordersFilterSchema.partial().optional(),
});
export type OrdersGetPageInput = z.infer<typeof ordersGetPageInputSchema>;
