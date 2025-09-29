import * as z from "zod";

export const brandEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z.string("Name is required").min(1, "Name is required"),
  slug: z.string("Slug is required").min(1, "Slug is required"),
  logoMediaId: z
    .number("Logo media ID must be a number")
    .nonnegative("Logo media ID must be positive"),

  createdAt: z.coerce.date("Created at must be a date"),
  updatedAt: z.coerce.date("Updated at must be a date"),
});
export type Brand = z.infer<typeof brandEntitySchema>;

export const createBrandInputSchema = brandEntitySchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateBrandInput = z.infer<typeof createBrandInputSchema>;

export const updateBrandInputSchema = brandEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateBrandInput = z.infer<typeof updateBrandInputSchema>;
