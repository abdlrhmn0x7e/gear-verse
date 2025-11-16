import z from "zod";

export const brandsFilters = z
  .object({
    categorySlug: z.string(),
  })
  .partial();
export type BrandsFilters = z.infer<typeof brandsFilters>;

export const brandsFindAllInputSchema = z.object({
  filters: brandsFilters.optional(),
});
export type BrandsFindAllInput = z.infer<typeof brandsFindAllInputSchema>;
