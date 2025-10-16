import { z } from "zod";
import { paginationSchema } from "../pagination";

export const productsFilterSchema = z
  .object({
    title: z.string(),
    categories: z.array(z.string()),
    brands: z.array(z.string()),
    price: z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .partial(),
  })
  .partial();

export type ProductsFilter = z.infer<typeof productsFilterSchema>;

export const productSortBySchema = z.enum([
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
]);
export type ProductSortBy = z.infer<typeof productSortBySchema>;

export const productsGetPageInputSchema = paginationSchema.extend({
  filters: productsFilterSchema.optional(),
  sortBy: productSortBySchema.optional(),
});
export type ProductsGetPageInput = z.infer<typeof productsGetPageInputSchema>;
