import * as z from "zod";

export const productSchema = z.object({
  title: z.string().min(1),
  description: z.record(z.string(), z.unknown()),

  categoryId: z.number().min(1),
  brandId: z.number().min(1),
});
