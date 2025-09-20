import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const addressesRouter = createTRPCRouter({
  getAddress: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.addresses.queries.find(input.id);
    }),
});
