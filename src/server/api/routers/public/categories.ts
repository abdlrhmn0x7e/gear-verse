import { createTRPCRouter, publicProcedure } from "../../trpc";
import z from "zod";

export const userCategoriesRouter = createTRPCRouter({
  findAll: publicProcedure
    .input(
      z
        .object({
          filters: z
            .object({
              root: z.boolean(),
            })
            .partial(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.categories.queries.findAll({
        filters: input?.filters,
      });
    }),
});
