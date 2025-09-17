import { DB } from "~/server/repositories";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import z from "zod";

export const categoriesRouter = createTRPCRouter({
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
    .query(({ input }) => {
      return DB.user.categories.queries.findAll({
        filters: input?.filters,
      });
    }),
});
