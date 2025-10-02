import type { JSONContent } from "@tiptap/react";
import z from "zod";

export const productEntitySchema = z.object({
  id: z.number("ID must be a number").positive("ID must be positive"),

  title: z.string("Title is required").min(1, "Title is too short"),
  price: z.coerce
    .number<number>("Price is required")
    .min(1, "Price is required"),
  slug: z.string("Slug is required").min(1, "Slug is too short"),
  summary: z.string("Summary is required").min(1, "Summary is too short"),
  description: z.custom<JSONContent>(),
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
  thumbnail: z.object({
    id: z.number().positive(),
    url: z.string("Thumbnail URL must be a string"),
  }),
  optionValues: z.record(
    z.string(),
    z.object({
      id: z.number().positive(),
      value: z.string("Value must be a string"),
    }),
  ),

  overridePrice: z.coerce
    .number<number>("Price is required")
    .nonnegative("Price must be nonnegative")
    .optional(),
  stock: z.number("Stock is required").nonnegative("Stock must be nonnegative"),
});
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantInputSchema
>;

export const createProductOptionInputSchema = z.object({
  name: z.string("name must be a string").min(1, "Name is too short"),
  values: z.array(
    z.object({
      id: z.number().positive(),
      value: z.string("value must be a string").min(1, "Value is too short"),
    }),
  ),
});
export type CreateProductOptionInput = z.infer<
  typeof createProductOptionInputSchema
>;

export const createProductInputSchema = productEntitySchema
  .omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    profit: z.coerce
      .number<number>("Profit is required")
      .nonnegative("Profit must be nonnegative"),
    margin: z.coerce
      .number<number>("Margin is required")
      .nonnegative("Margin must be nonnegative")
      .max(100, "Margin must be less than or equal to 100"),
    seo: z
      .object({
        pageTitle: z.string("Page title is required"),
        urlHandler: z
          .string("URL handle is required")
          .regex(
            /^$|^[a-z0-9-]+$/,
            "URL handle must be empty or lowercase and contain only letters, numbers, and hyphens",
          ),
        metaDescription: z.string("Meta description is required"),
      })
      .partial()
      .optional(),
    media: z.array(createProductMediaInputSchema),
    options: z
      .array(createProductOptionInputSchema)
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
