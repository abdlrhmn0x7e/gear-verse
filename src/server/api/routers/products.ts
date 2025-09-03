import { DB } from "~/server/repositories";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { productSchema } from "~/lib/schemas/product";

export const productsRouter = createTRPCRouter({
  /**
   * Mutations
   */
  create: adminProcedure
    .input(productSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(({ input }) => {
      return DB.products.mutations.create(input);
    }),
});
