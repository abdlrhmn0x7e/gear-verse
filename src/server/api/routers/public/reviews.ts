import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { TRPCError } from "@trpc/server";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { createReviewInputSchema } from "~/lib/schemas/entities/reviews";

export const userReviewsRouter = createTRPCRouter({
  findAll: publicProcedure
    .input(
      z.object({
        productId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.public.reviews.queries.findAll(input.productId),
      );
      if (error) {
        throw errorMap(error);
      }
      return data;
    }),

  create: protectedProcedure
    .input(
      createReviewInputSchema.extend({
        productId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.app.public.reviews.mutations.create(
          input,
          Number(ctx.session.user.id),
          input.productId,
        ),
      );
      if (error) {
        throw errorMap(error);
      }

      return data;
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
