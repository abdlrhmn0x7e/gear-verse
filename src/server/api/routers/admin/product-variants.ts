import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { DB } from "~/server/repositories";
import { productVariantSchema } from "~/lib/schemas/product-variants";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const productVariantsRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      productVariantSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ input }) => {
      const createdVariant =
        await DB.admin.productVariants.mutations.create(input);

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
    .mutation(async ({ input }) => {
      return DB.admin.productVariants.mutations.bulkDelete(input);
    }),

  update: adminProcedure
    .input(
      productVariantSchema
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
    .mutation(async ({ input }) => {
      const { id, oldThumbnailMediaId, ...rest } = input;
      return DB.admin.productVariants.mutations.update(
        id,
        oldThumbnailMediaId,
        rest,
      );
    }),

  bulkCreate: adminProcedure
    .input(
      z.array(
        productVariantSchema.omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const createdVariants =
        await DB.admin.productVariants.mutations.bulkCreate(input);

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
        productVariantSchema
          .omit({
            createdAt: true,
            updatedAt: true,
          })
          .partial()
          .and(z.object({ id: z.number() })),
      ),
    )
    .mutation(async ({ input }) => {
      return DB.admin.productVariants.mutations.bulkUpdate(input);
    }),
});
