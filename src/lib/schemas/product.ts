import z from "zod";

export const productSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z.string("Name is required").min(1, "Name is too short"),
  slug: z.string("Slug is required").min(1, "Slug is too short"),
  summary: z.string("Summary is required").min(1, "Summary is too short"),
  description: z.record(z.string(), z.unknown(), "Description is required"),
  published: z.boolean("Published is required"),

  categoryId: z.number("Category is required").min(1, "Category is required"),
  brandId: z.number("Brand is required").min(1, "Brand is required"),

  specifications: z.record(
    z.string(),
    z.string(),
    "Specifications are required",
  ),

  thumbnailMediaId: z
    .number("Thumbnail media ID is required")
    .min(1, "Thumbnail media ID is required"),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});

export type Product = z.infer<typeof productSchema>;
