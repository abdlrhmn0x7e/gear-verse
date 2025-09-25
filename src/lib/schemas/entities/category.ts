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

  parentId: z.number("Parent ID must be a number").nullish(),

  createdAt: z.coerce.date("Created at must be a date"),
});
export type Category = z.infer<typeof categoryEntitySchema>;

export const categoryTreeSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),
  name: z.string("Name is required").min(1, "Name is required"),
  icon: categoryIconEnum,
  slug: z.string("Slug is required").min(1, "Slug is required"),
  createdAt: z.coerce.date("Created at must be a date"),

  get children() {
    return z.array(categoryTreeSchema).nullish();
  },
});
export type CategoryTree = z.infer<typeof categoryTreeSchema>;

export const createCategoryInputSchema = categoryEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = categoryEntitySchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
