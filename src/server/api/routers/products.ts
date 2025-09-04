import { DB } from "~/server/repositories";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { productSchema } from "~/lib/schemas/product";

export const productsRouter = createTRPCRouter({
  /**
   * Queries
   */
  findAll: adminProcedure.query(() => {
    return DB.products.queries.all();
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
