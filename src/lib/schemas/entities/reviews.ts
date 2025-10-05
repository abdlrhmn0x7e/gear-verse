import z from "zod";

export const reviewSchema = z.object({
  id: z.number(),

  rating: z.number(),
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
