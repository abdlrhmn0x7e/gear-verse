import { z } from "zod";
import { createInventoryItemInputSchema } from "./inventory-item";

export const productVariantEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  overridePrice: z.coerce
    .number<number>("Price is required")
    .nonnegative("Price must be positive")
    .nullable(),

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

export const createProductVariantInputSchema = productVariantEntitySchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    thumbnailMediaId: true,
  })
  .extend({
    inventory: createInventoryItemInputSchema,
    thumbnail: z.object({
      mediaId: z
        .number("Id must be a number")
        .nonnegative("Id must be non-negative"),
      url: z.url("URL must be valid"),
    }),
  });
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantInputSchema
>;

export const updateProductVariantInputSchema = createProductVariantInputSchema
  .omit({ productId: true })
  .extend({
    options: z
      .record(z.string(), z.object({ id: z.number(), value: z.string() }))
      .array(),
  })
  .partial()
  .extend({
    id: z.number("Id must be a number").nonnegative("ID must be positive"),
  });
export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantInputSchema
>;
