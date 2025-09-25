import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { productVariantEntitySchema } from "~/lib/schemas/entities/product-variants";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { paginationSchema } from "~/lib/schemas/contracts/pagination";
import { paginate } from "~/server/application/helpers/pagination";

export const productVariantsRouter = createTRPCRouter({
  findAll: adminProcedure.query(({ ctx }) => {
    return ctx.db.admin.productVariants.queries.findAll();
  }),

  getPage: adminProcedure
    .input(
      paginationSchema.extend({
        filters: z
          .object({
            search: z.string(),
            productId: z.number(),
          })
          .partial()
          .optional(),
      }),
    )
    .query(({ ctx, input }) => {
      return paginate({
        input,
        getPage: ({ cursor, pageSize }) =>
          ctx.db.admin.productVariants.queries.getPage({
            cursor,
            pageSize,
            filters: input.filters,
          }),
      });
    }),

  create: adminProcedure
    .input(
      productVariantEntitySchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createdVariant =
        await ctx.db.admin.productVariants.mutations.create(input);

      if (!createdVariant) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product variant",
        });
      }

      return createdVariant;
    }),

  bulkDelete: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.admin.productVariants.mutations.bulkDelete(input);
    }),

  update: adminProcedure
    .input(
      productVariantEntitySchema
        .omit({
          createdAt: true,
          updatedAt: true,
        })
        .partial()
        .and(
          z.object({
            id: z.number(),
            oldThumbnailMediaId: z.number().nullable(),
          }),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, oldThumbnailMediaId, ...rest } = input;
      return ctx.db.admin.productVariants.mutations.update(
        id,
        oldThumbnailMediaId,
        rest,
      );
    }),

  bulkCreate: adminProcedure
    .input(
      z.array(
        productVariantEntitySchema.omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const createdVariants =
        await ctx.db.admin.productVariants.mutations.bulkCreate(input);

      if (!createdVariants) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product variants",
        });
      }

      return createdVariants;
    }),

  bulkUpdate: adminProcedure
    .input(
      z.array(
        productVariantEntitySchema
          .omit({
            createdAt: true,
            updatedAt: true,
          })
          .partial()
          .and(z.object({ id: z.number() })),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.admin.productVariants.mutations.bulkUpdate(input);
    }),
});
