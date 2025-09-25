import z from "zod";

export const productEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  title: z.string("Title is required").min(1, "Title is too short"),
  price: z.number("Price is required").min(1, "Price is required"),
  slug: z.string("Slug is required").min(1, "Slug is too short"),
  summary: z.string("Summary is required").min(1, "Summary is too short"),
  description: z.record(z.string(), z.unknown(), "Description is required"),
  published: z.boolean("Published is required"),

  categoryId: z.number("Category is required").min(1, "Category is required"),
  brandId: z.number("Brand is required").min(1, "Brand is required"),

  thumbnailMediaId: z
    .number("Thumbnail media ID is required")
    .min(1, "Thumbnail media ID is required"),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});

export type Product = z.infer<typeof productEntitySchema>;

export const createProductInputSchema = productEntitySchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    media: z.array(z.string()),
  });
export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = productEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
