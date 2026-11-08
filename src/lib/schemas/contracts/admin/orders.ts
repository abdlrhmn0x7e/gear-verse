import z from "zod";
import { dashboardRanges } from "~/server/application/helpers/dashboard-range";
import { paginationSchema } from "../pagination";

export const ordersFilterSchema = z.object({
  /** Matches the phone, the recipient or account name, or the order number. */
  search: z.string(),
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"]),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  /** Placed since the start of this Cairo-time window. */
  placed: z.enum(dashboardRanges),
});
export type OrdersFilter = z.infer<typeof ordersFilterSchema>;

export const ordersGetPageInputSchema = paginationSchema.extend({
  filters: ordersFilterSchema.partial().optional(),
});
export type OrdersGetPageInput = z.infer<typeof ordersGetPageInputSchema>;
