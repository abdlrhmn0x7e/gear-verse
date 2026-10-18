import z from "zod";

export const reviewSchema = z.object({
  id: z.number(),

  rating: z
    .number("Rating must be a number")
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Review = z.infer<typeof reviewSchema>;

export const createReviewInputSchema = reviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const updateReviewInputSchema = createReviewInputSchema.partial();
export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;
