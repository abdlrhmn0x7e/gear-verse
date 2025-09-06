import * as z from "zod";

export const brandSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z.string("Name is required").min(1, "Name is required"),
  logoMediaId: z
    .number("Logo media ID must be a number")
    .nonnegative("Logo media ID must be positive"),

  createdAt: z.coerce.date("Created at must be a date"),
  updatedAt: z.coerce.date("Updated at must be a date"),
});
export type Brand = z.infer<typeof brandSchema>;
