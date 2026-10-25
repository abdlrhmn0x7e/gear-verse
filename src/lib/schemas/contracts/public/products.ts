import { z } from "zod";
import { paginationSchema } from "../pagination";
import { routing } from "~/i18n/routing";

/** Route handlers can't read the [locale] segment, so storefront queries send it. */
export const localeSchema = z
  .enum(routing.locales)
  .default(routing.defaultLocale);

export const productsFilterSchema = z
  .object({
    title: z.string(),
    categories: z.array(z.string()),
    brands: z.array(z.string()),
    price: z.object({
      min: z.number(),
      max: z.number(),
    }),
  })
  .partial();

export type ProductsFilter = z.infer<typeof productsFilterSchema>;

export const productSortBySchema = z.enum([
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "trending",
]);
export type ProductSortBy = z.infer<typeof productSortBySchema>;

export const productsGetPageInputSchema = paginationSchema.extend({
  filters: productsFilterSchema.optional(),
  sortBy: productSortBySchema.optional(),
  locale: localeSchema,
});
export type ProductsGetPageInput = z.infer<typeof productsGetPageInputSchema>;
