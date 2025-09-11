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
      const createdVariant = await DB.productVariants.mutations.create(input);

      if (!createdVariant) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product variant",
        });
      }

      return createdVariant;
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
      return DB.productVariants.mutations.bulkCreate(input);
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
      return DB.productVariants.mutations.bulkUpdate(input);
    }),
});
