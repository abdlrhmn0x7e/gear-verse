import z from "zod";

export const categoryIconEnum = z.enum([
  "KEYBOARDS",
  "MICE",
  "MONITORS",
  "SPEAKERS",
  "HEADSETS",
  "CONTROLLERS",
  "WIRED",
  "WIRELESS",
  "MICROPHONES",
  "STORAGE",
  "LAPTOPS",
  "CHARGERS",
  "BAGS",
  "CABLES",
  "WEBCAMS",
]);
export type CategoryIconEnum = z.infer<typeof categoryIconEnum>;

export const categoryEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z
    .string("Name is required")
    .min(1, "Name is required")
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  icon: categoryIconEnum,
  slug: z.string("Slug is required").min(1, "Slug is required"),

  parent_id: z.number("Parent ID must be a number").nullish(),

  created_at: z.coerce.date<Date>("Created at must be a date"),
  updated_at: z.coerce.date<Date>("Updated at must be a date"),
});
export type Category = z.infer<typeof categoryEntitySchema>;

export const categoryTreeSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),
  name: z.string("Name is required").min(1, "Name is required"),
  icon: categoryIconEnum,
  slug: z.string("Slug is required").min(1, "Slug is required"),
  created_at: z.coerce.date<Date>("Created at must be a date"),

  get children() {
    return z.array(categoryTreeSchema).nullish();
  },
});
export type CategoryTree = z.infer<typeof categoryTreeSchema>;

export const createCategoryInputSchema = categoryEntitySchema.omit({
  id: true,
  slug: true,
  created_at: true,
  updated_at: true,
});
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = categoryEntitySchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
  .and(
    z.object({
      id: z.number("ID is required").positive("ID must be positive"),
    }),
  );
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
