import { adminProcedure, createTRPCRouter } from "../../init";

export const usersRouter = createTRPCRouter({
  queries: {
    getCount: adminProcedure.query(async ({ ctx }) => {
      return ctx.app.admin.users.queries.getCount();
    }),
  },
});
