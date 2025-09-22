import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { TRPCError } from "@trpc/server";

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

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        rating: z.number(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const review = await ctx.db.user.reviews.mutations.update(
        id,
        Number(ctx.session.user.id),
        rest,
      );

      if (!review) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to update review",
        });
      }

      return review;
    }),
});
