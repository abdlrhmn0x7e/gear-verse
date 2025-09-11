import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z.string("Name is required").min(1, "Name is required"),

  productId: z
    .number("Product ID must be a number")
    .nonnegative("Product ID must be positive"),
  thumbnailMediaId: z
    .number("Thumbnail Media ID must be a number")
    .nonnegative("Thumbnail Media ID must be positive"),

  createdAt: z.coerce.date("Created at must be a date"),
  updatedAt: z.coerce.date("Updated at must be a date"),
});

export type ProductVariant = z.infer<typeof productVariantSchema>;
