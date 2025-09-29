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
