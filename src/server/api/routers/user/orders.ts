import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const userOrdersRouter = createTRPCRouter({
  findById: protectedProcedure.query(({ ctx }) => {
    return null;
  }),
});
