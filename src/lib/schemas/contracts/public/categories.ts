import z from "zod";
import { paginationSchema } from "../pagination";

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

const filters = [
  {
    type: "multi",
    value: ["red", "blue"],
  },
  {
    type: "select",
    value: "lg",
  },
];

export const categoryProductsFilterSchema = z.array(
  z.union([
    z.object({
      type: z.templateLiteral(["multi.", z.string()]),
      value: z.string().array(),
    }),
    z.object({
      type: z.templateLiteral(["select.", z.string()]),
      value: z.string(),
    }),
    z.object({
      type: z.templateLiteral(["bool.", z.string()]),
      value: z.boolean(),
    }),
  ]),
);
export type CategoryProductsFilters = z.infer<
  typeof categoryProductsFilterSchema
>;
export const categoryProductsInputSchema = paginationSchema.extend({
  slug: z.string(),
  filters: categoryProductsFilterSchema.optional(),
});
export type CategoryProductsInput = z.infer<typeof categoryProductsInputSchema>;
