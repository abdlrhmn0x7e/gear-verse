import z from "zod";
import { paginationSchema } from "~/lib/schemas/pagination";
import { productSchema } from "~/lib/schemas/product";
import { DB } from "~/server/repositories";
import { paginate } from "../helpers/pagination";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "~/lib/utils/slugs";

export const productsRouter = createTRPCRouter({
  /**
   * Queries
   */
  findAll: adminProcedure.query(() => {
    return DB.products.queries.findAll();
  }),

  getPage: adminProcedure
    .input(
      paginationSchema.extend({
        filters: z
          .object({
            name: z.string(),
            brands: z.array(z.number()),
          })
          .partial()
          .optional(),
      }),
    )
    .query(({ input }) => {
      return paginate({ input, getPage: DB.products.queries.getPage });
    }),

  findById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await DB.products.queries.findById(input.id);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(
      productSchema.omit({
        id: true,
        slug: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(({ input }) => {
      return DB.products.mutations.create({
        ...input,
        slug: generateSlug(input.name),
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: productSchema
          .omit({
            id: true,
            createdAt: true,
            updatedAt: true,
          })
          .partial(),
      }),
    )
    .mutation(({ input }) => {
      return DB.products.mutations.update(input.id, input.data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      return DB.products.mutations.delete(input.id);
    }),
});
