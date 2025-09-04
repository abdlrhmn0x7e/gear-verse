import { DB } from "~/server/repositories";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { productSchema } from "~/lib/schemas/product";
import { paginationSchema } from "~/lib/schemas/pagination";
import { paginate } from "../helpers/pagination";
import z from "zod";

export const productsRouter = createTRPCRouter({
  /**
   * Queries
   */
  findAll: adminProcedure.query(() => {
    return DB.products.queries.findAll();
  }),

  getPage: adminProcedure
    .input(paginationSchema.extend({ title: z.string().nullish() }))
    .query(({ input }) => {
      return paginate({ input, getPage: DB.products.queries.getPage });
    }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(productSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(({ input }) => {
      return DB.products.mutations.create(input);
    }),
});
