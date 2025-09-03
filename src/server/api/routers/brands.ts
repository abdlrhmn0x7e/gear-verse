import { DB } from "~/server/repositories";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import z from "zod";
import { base64DecodeNumber, base64EncodeNumber } from "~/lib/utils/base64";
import { TRPCError } from "@trpc/server";
import { tryCatch } from "~/lib/utils/try-catch";
import { brandSchema } from "~/lib/schemas/brand";

export const brandsRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: publicProcedure
    .input(z.object({ cursor: z.string().optional(), pageSize: z.number() }))
    .query(async ({ input }) => {
      const cursor = input.cursor
        ? base64DecodeNumber(input.cursor)
        : undefined;

      const { error, data } = await tryCatch(
        DB.brands.queries.getPage({
          cursor,
          pageSize: input.pageSize,
        }),
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get brands page",
        });
      }

      const hasNextPage = data.length > input.pageSize && !!data.pop();
      const lastItem = data[data.length - 1];
      if (!lastItem) {
        return { data: [], nextCursor: null };
      }

      const nextCursor = hasNextPage ? base64EncodeNumber(lastItem.id) : null;

      return {
        data,
        nextCursor,
      };
    }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(brandSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(({ input }) => {
      return DB.brands.mutations.create(input);
    }),
});
