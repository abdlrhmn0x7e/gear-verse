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
    profit: z
      .number("Profit is required")
      .nonnegative("Profit must be nonnegative"),
    margin: z
      .number("Margin is required")
      .nonnegative("Margin must be nonnegative")
      .max(100, "Margin must be less than or equal to 100"),
    seo: z
      .object({
        pageTitle: z.string("Page title is required").optional(),
        urlHandler: z
          .string("URL handle is required")
          .regex(
            /^$|^[a-z0-9-]+$/,
            "URL handle must be empty or lowercase and contain only letters, numbers, and hyphens",
          )
          .optional(),
        metaDescription: z.string("Meta description is required").optional(),
      })
      .partial(),
    media: z.array(createProductMediaInputSchema),
    options: z
      .array(
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
      )
      .min(1, "Options are required"),
    variants: z
      .array(createProductVariantInputSchema)
      .min(1, "Variants are required"),
  });
export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = productEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
