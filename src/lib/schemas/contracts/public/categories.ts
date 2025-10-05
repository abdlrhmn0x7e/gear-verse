import z from "zod";

export const categoriesFilterSchema = z
  .object({
    root: z.boolean(),
  })
  .partial()
  .optional();
export type CategoriesFilter = z.infer<typeof categoriesFilterSchema>;

export const categoriesFindAllInputSchema = z
  .object({
    filters: categoriesFilterSchema,
  })
  .optional();
export type CategoriesFindAllInput = z.infer<
  typeof categoriesFindAllInputSchema
>;
