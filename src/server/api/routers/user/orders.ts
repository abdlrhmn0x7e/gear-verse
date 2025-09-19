import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const userOrdersRouter = createTRPCRouter({
  findById: protectedProcedure.query(() => {
    return null;
  }),
});
