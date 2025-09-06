import { listingSchema } from "~/lib/schemas/listing";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { DB } from "~/server/repositories";
import z from "zod";

export const listingRouter = createTRPCRouter({
  /**
   * Mutations
   */
  mutations: {
    create: adminProcedure
      .input(
        listingSchema
          .omit({ id: true, createdAt: true, updatedAt: true })
          .and(z.object({ products: z.array(z.number()) })),
      )
      .mutation(({ input }) => {
        const { products, ...data } = input;
        return DB.listings.mutations.create(data, products);
      }),
  },
});
