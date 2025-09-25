import { z } from "zod";

export const productVariantEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z.string("Name is required").min(1, "Name is required"),
  stock: z.coerce
    .number<number>("Stock is required")
    .nonnegative("Stock must be positive"),
  price: z.coerce
    .number<number>("Price is required")
    .nonnegative("Price must be positive"),
  options: z.array(z.string("Options must be an array of strings")).default([]),

  productId: z
    .number("Product ID must be a number")
    .nonnegative("Product ID must be positive"),
  thumbnailMediaId: z
    .number("Thumbnail Media ID must be a number")
    .nonnegative("Thumbnail Media ID must be positive"),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});

export type ProductVariant = z.infer<typeof productVariantEntitySchema>;

export const createProductVariantInputSchema = productVariantEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantInputSchema
>;

export const updateProductVariantInputSchema = productVariantEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantInputSchema
>;
