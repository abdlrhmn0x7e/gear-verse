import { z } from "zod";

export const deleteCategoryInputSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),
});
export type DeleteCategoryInput = z.infer<typeof deleteCategoryInputSchema>;
