import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/init";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { createReviewInputSchema } from "~/lib/schemas/entities/reviews";

export const userReviewsRouter = createTRPCRouter({
  queries: {
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
  },

  mutations: {
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
            ctx.user.id,
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
        const { data, error } = await tryCatch(
          ctx.app.public.reviews.mutations.update(id, ctx.user.id, rest),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
    delete: protectedProcedure
      .input(
        z.object({
          id: z.number(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id } = input;
        const { data, error } = await tryCatch(
          ctx.app.public.reviews.mutations.delete(id, ctx.user.id),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
