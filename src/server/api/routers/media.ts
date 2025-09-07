import { mediaOwnerTypeEnum, mediaSchema } from "~/lib/schemas/media";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { DB } from "~/server/repositories";
import z from "zod";
import { s3GetPublicUrl } from "~/lib/s3";
import { paginate } from "../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import { TRPCError } from "@trpc/server";

export const mediaRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: adminProcedure.input(paginationSchema).query(({ input }) => {
    return paginate({ input, getPage: DB.media.queries.getPage });
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
    .mutation(async ({ input }) => {
      const media = await DB.media.mutations.update(input.id, input.data);
      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        });
      }

      return media;
    }),

  updateMany: adminProcedure
    .input(z.array(mediaSchema))
    .mutation(async ({ input }) => {
      const media = await DB.media.mutations.updateMany(input);
      if (media.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "None of the media items were found to be updated",
        });
      }

      return media;
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.number(),
        ownerType: mediaOwnerTypeEnum,
      }),
    )
    .mutation(async ({ input }) => {
      const media = await DB.media.mutations.delete(input.id, input.ownerType);
      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        });
      }

      return media;
    }),
});
