import * as z from "zod";

export const productSchema = z.object({
  id: z.number(),

  title: z.string().min(1, "Title is too short"),
  description: z.record(z.string(), z.unknown()),

  categoryId: z.number().min(1, "Category is required"),
  brandId: z.number().min(1, "Brand is required"),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Product = z.infer<typeof productSchema>;
