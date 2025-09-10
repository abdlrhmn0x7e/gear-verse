import z from "zod";

export const productSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  title: z.string("Title is required").min(1, "Title is too short"),
  description: z.record(z.string(), z.unknown(), "Description is required"),

  categoryId: z.number("Category is required").min(1, "Category is required"),
  brandId: z.number("Brand is required").min(1, "Brand is required"),

  createdAt: z.coerce.date("Created at must be a date"),
  updatedAt: z.coerce.date("Updated at must be a date"),
});

export type Product = z.infer<typeof productSchema>;
