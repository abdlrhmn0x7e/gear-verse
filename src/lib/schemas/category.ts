import z from "zod";

export const categorySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),
  name: z
    .string("Name is required")
    .min(1, "Name is required")
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  slug: z.string("Slug is required").min(1, "Slug is required"),

  parent_id: z.number("Parent ID must be a number").nullish(),

  created_at: z.coerce.date("Created at must be a date"),
});
export type Category = z.infer<typeof categorySchema>;

export const categoryTreeSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),
  name: z.string("Name is required").min(1, "Name is required"),
  slug: z.string("Slug is required").min(1, "Slug is required"),
  created_at: z.coerce.date("Created at must be a date"),

  get children() {
    return z.array(categoryTreeSchema).nullish();
  },
});
export type CategoryTree = z.infer<typeof categoryTreeSchema>;
