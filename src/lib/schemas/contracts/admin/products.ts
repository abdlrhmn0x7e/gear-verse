import { z } from "zod";
import { paginationSchema } from "../pagination";

export const productsFilterSchema = z
  .object({
    title: z.string(),
    brands: z.array(z.number()),
    categories: z.array(z.number()),
  })
  .partial()
  .optional();
export type ProductsFilter = z.infer<typeof productsFilterSchema>;

export const productsGetPageInputSchema = paginationSchema.extend({
  filters: productsFilterSchema.optional(),
});
export type ProductsGetPageInput = z.infer<typeof productsGetPageInputSchema>;

export const productsBulkDeleteInputSchema = z.object({
  ids: z.array(z.number()).min(1, "At least one product ID is required"),
});
export type ProductsBulkDeleteInput = z.infer<
  typeof productsBulkDeleteInputSchema
>;
