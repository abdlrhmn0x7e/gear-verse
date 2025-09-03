import * as z from "zod";

export const productSchema = z.object({
  id: z.number(),

  title: z.string().min(1),
  description: z.record(z.string(), z.unknown()),

  thumbnailMediaId: z.number().min(1),

  categoryId: z.number().min(1),
  brandId: z.number().min(1),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
