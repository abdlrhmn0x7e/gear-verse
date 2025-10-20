import { z } from "zod";
import { paginationSchema } from "../pagination";

export const ordersFilterSchema = z
  .object({
    orderNumber: z.string(),
  })
  .partial();

export type OrdersFilter = z.infer<typeof ordersFilterSchema>;

export const ordersGetPageInputSchema = paginationSchema.extend({
  filters: ordersFilterSchema.optional(),
});
export type OrdersGetPageInput = z.infer<typeof ordersGetPageInputSchema>;
