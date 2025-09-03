import { mediaSchema } from "~/lib/schemas/media";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { DB } from "~/server/repositories";
import z from "zod";
import { s3GetPublicUrl } from "~/lib/s3";
import { tryCatch } from "~/lib/utils/try-catch";
import { TRPCError } from "@trpc/server";
import { base64DecodeNumber, base64EncodeNumber } from "~/lib/utils/base64";

export const mediaRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: adminProcedure
    .input(z.object({ cursor: z.string().optional(), pageSize: z.number() }))
    .query(async ({ input }) => {
      const cursor = input.cursor
        ? base64DecodeNumber(input.cursor)
        : undefined;
      const { data, error } = await tryCatch(
        DB.media.queries.getPage({
          cursor,
          pageSize: input.pageSize,
        }),
      );
      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get media page",
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
    .input(
      mediaSchema.omit({ id: true, createdAt: true, url: true }).extend({
        key: z.string(),
      }),
    )
    .mutation(({ input }) => {
      return DB.media.mutations.create({
        ...input,
        url: s3GetPublicUrl(input.key),
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: mediaSchema
          .omit({ id: true, createdAt: true, url: true })
          .partial(),
      }),
    )
    .mutation(({ input }) => {
      return DB.media.mutations.update(input.id, input.data);
    }),
});
