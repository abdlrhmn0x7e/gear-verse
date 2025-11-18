import z from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/init";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";

export const reviewsRouter = createTRPCRouter({
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
    delete: protectedProcedure
      .input(
        z.object({
          id: z.number(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id } = input;
        const { data, error } = await tryCatch(
          ctx.app.admin.reviews.mutations.delete(id),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
