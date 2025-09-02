import z from "zod";

export const categorySchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(1, { message: "Category name is required" })
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  slug: z.string().min(1),

  parent_id: z.number().nullish(),

  created_at: z.coerce.date(),
});
export type Category = z.infer<typeof categorySchema>;

export const categoryTreeSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  created_at: z.coerce.date(),

  get children() {
    return z.array(categoryTreeSchema).nullish();
  },
});
export type CategoryTree = z.infer<typeof categoryTreeSchema>;
