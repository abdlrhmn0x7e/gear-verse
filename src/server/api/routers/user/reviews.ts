import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

export const userReviewsRouter = createTRPCRouter({
  findAll: publicProcedure
    .input(
      z.object({
        productId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.user.reviews.queries.findAll(input.productId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        rating: z.number(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.reviews.mutations.create({
        userId: Number(ctx.session.user.id),
        ...input,
      });
    }),
});
