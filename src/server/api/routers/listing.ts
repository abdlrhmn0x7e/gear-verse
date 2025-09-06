import { listingSchema } from "~/lib/schemas/listing";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { DB } from "~/server/repositories";
import z from "zod";
import { paginationSchema } from "~/lib/schemas/pagination";
import { paginate } from "../helpers/pagination";
import { TRPCError } from "@trpc/server";

export const listingRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    getPage: adminProcedure
      .input(
        paginationSchema.extend({
          filters: z.object({ title: z.string() }).partial().optional(),
        }),
      )
      .query(({ input }) => {
        return paginate({ input, getPage: DB.listings.queries.getPage });
      }),

    findById: adminProcedure
      .input(
        z.object({
          id: z.number(),
        }),
      )
      .query(async ({ input }) => {
        const listing = await DB.listings.queries.findById(input.id);
        if (!listing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Listing not found",
          });
        }

        return listing;
      }),
  },

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
