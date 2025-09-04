import { DB } from "~/server/repositories";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { brandSchema } from "~/lib/schemas/brand";
import { paginationSchema } from "~/lib/schemas/pagination";
import { paginate } from "../helpers/pagination";

export const brandsRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: adminProcedure.input(paginationSchema).query(({ input }) => {
    return paginate({ input, getPage: DB.brands.queries.getPage });
  }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(brandSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(({ input }) => {
      return DB.brands.mutations.create(input);
    }),
});
