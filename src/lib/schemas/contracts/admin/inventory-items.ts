import { z } from "zod";
import { paginationSchema } from "../pagination";

export const inventoryItemFilterSchema = z
  .object({
    inventorySearch: z.string(),
  })
  .partial();

export const inventoryItemsGetPageInputSchema = paginationSchema.extend({
  filters: inventoryItemFilterSchema.optional(),
});
export type InventoryItemsGetPageInput = z.infer<
  typeof inventoryItemsGetPageInputSchema
>;
