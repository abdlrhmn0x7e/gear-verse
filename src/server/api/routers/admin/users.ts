import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const adminUsersRouter = createTRPCRouter({
  findAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.admin.users.queries.findAll();
  }),
});
