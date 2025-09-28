import z from "zod";

export const productEntitySchema = z.object({
  id: z.number("ID must be a number").positive("ID must be positive"),

  title: z.string("Title is required").min(1, "Title is too short"),
  price: z.number("Price is required").min(1, "Price is required"),
  slug: z.string("Slug is required").min(1, "Slug is too short"),
  summary: z.string("Summary is required").min(1, "Summary is too short"),
  description: z.record(z.string(), z.unknown(), "Description is required"),
  published: z.boolean("Published is required"),

  categoryId: z
    .number("Category is required")
    .positive("Category must be positive"),
  brandId: z.number("Brand is required").positive("Brand must be positive"),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});

export type Product = z.infer<typeof productEntitySchema>;

export const productMediaEntitySchema = z.object({
  id: z.number("ID must be a number").positive("ID must be positive"),
  productId: z
    .number("Product ID is required")
    .positive("Product ID must be positive"),
  mediaId: z
    .number("Media ID is required")
    .positive("Media ID must be positive"),
  order: z.number("Order is required").positive("Order must be positive"),
});
export type ProductMedia = z.infer<typeof productMediaEntitySchema>;

export const createProductMediaInputSchema = productMediaEntitySchema.omit({
  id: true,
  productId: true,
  order: true, // whatever the order the array is in, that's the order
});
export type CreateProductMediaInput = z.infer<
  typeof createProductMediaInputSchema
>;

export const createProductVariantInputSchema = z.object({
  optionValues: z.record(
    z.string(),
    z.object({
      id: z.cuid("Value ID must be a cuid"),
      value: z.string("Value must be a string"),
    }),
  ),

  thumbnail: z.object({
    id: z
      .number("Thumbnail media ID is required")
      .positive("Thumbnail media ID must be positive"),
    url: z.url("Thumbnail media URL is required"),
  }),
  overridePrice: z
    .number("Price is required")
    .nonnegative("Price must be nonnegative")
    .optional(),
  stock: z.number("Stock is required").nonnegative("Stock must be nonnegative"),
});
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantInputSchema
>;

export const createProductInputSchema = productEntitySchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    media: z.array(createProductMediaInputSchema),
    options: z.array(
      z.object({
        id: z.cuid("id must be a cuid"),
        name: z.string("name must be a string").min(1, "Name is too short"),
        values: z.array(
          z.object({
            id: z.cuid("id must be a cuid"),
            value: z.string("Value is required").min(1, "Value is too short"),
          }),
        ),
      }),
    ),
    variants: z.array(createProductVariantInputSchema),
  });
export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = productEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
