import {
  createMediaInputSchema,
  mediaEntitySchema,
} from "~/lib/schemas/entities/media";
import { adminProcedure, createTRPCRouter } from "../../trpc";
import z from "zod";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { mediaGetPageInputSchema } from "~/lib/schemas/contracts/admin/media";

export const mediaRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    getPage: adminProcedure
      .input(mediaGetPageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.media.queries.getPage(input),
        );
        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },

  /**
   * Mutations
   */
  mutations: {
    createMany: adminProcedure
      .input(z.array(createMediaInputSchema))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.media.mutations.createMany(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
