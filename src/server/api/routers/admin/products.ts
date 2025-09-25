import z from "zod";
import { paginationSchema } from "~/lib/schemas/contracts/pagination";
import { productEntitySchema } from "~/lib/schemas/entities/product";
import { paginate } from "../../../application/helpers/pagination";
import { adminProcedure, createTRPCRouter } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "~/lib/utils/slugs";
import { productsGetPageInputSchema } from "~/lib/schemas/contracts/admin/products";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";

export const productsRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    getPage: adminProcedure
      .input(productsGetPageInputSchema)
      .query(({ ctx, input }) => {
        return ctx.app.admin.products.queries.getPage(input);
      }),

    findById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data: product, error: productError } = await tryCatch(
          ctx.app.admin.products.queries.findById(input.id),
        );
        if (productError) {
          throw errorMap(productError);
        }

        return product;
      }),
  },

  /**
   * Mutations
   */
  mutations: {
    create: adminProcedure
      .input(
        productEntitySchema.omit({
          id: true,
          slug: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        }),
      )
      .mutation(({ ctx, input }) => {
        return ctx.db.admin.products.mutations.create({
          ...input,
          slug: generateSlug(input.name),
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: productEntitySchema
            .omit({
              id: true,
              createdAt: true,
              updatedAt: true,
            })
            .partial(),
        }),
      )
      .mutation(({ ctx, input }) => {
        return ctx.db.admin.products.mutations.update(input.id, input.data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        return ctx.db.admin.products.mutations.delete(input.id);
      }),
  },
});
