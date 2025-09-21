import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const userAddressesRouter = createTRPCRouter({
  find: protectedProcedure.query(async ({ ctx }) => {
    const address = await ctx.db.user.addresses.queries.find(
      Number(ctx.session.user.id),
    );
    if (!address) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Address not found",
      });
    }

    return address;
  }),
});
