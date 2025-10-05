import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";

export const userCartsRouter = createTRPCRouter({
  find: protectedProcedure.query(async ({ ctx }) => {
    const { data: cart, error } = await tryCatch(
      ctx.app.public.carts.queries.find(Number(ctx.session.user.id)),
    );
    if (error) {
      throw errorMap(error);
    }

    return cart;
  }),
});
