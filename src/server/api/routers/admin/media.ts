import { mediaOwnerTypeEnum, mediaSchema } from "~/lib/schemas/media";
import { adminProcedure, createTRPCRouter } from "../../trpc";
import { DB } from "~/server/repositories";
import z from "zod";
import { s3GetPublicUrl } from "~/lib/s3";
import { paginate } from "../../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";
import { TRPCError } from "@trpc/server";
import { tryCatch } from "~/lib/utils/try-catch";

export const mediaRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: adminProcedure.input(paginationSchema).query(({ input }) => {
    return paginate({ input, getPage: DB.admin.media.queries.getPage });
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
      return DB.admin.media.mutations.create({
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
      const { data: media, error: mediaError } = await tryCatch(
        DB.admin.media.mutations.update(input.id, input.data),
      );
      if (mediaError) {
        console.error("[MEDIA UPDATE] Error updating media", mediaError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update media",
          cause: mediaError,
        });
      }

      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        });
      }

      return media;
    }),

  updateMany: adminProcedure
    .input(
      z.array(
        mediaSchema
          .partial()
          .omit({ url: true, createdAt: true })
          .extend({ id: z.number() }),
      ),
    )
    .mutation(async ({ input }) => {
      const { data: media, error: mediaError } = await tryCatch(
        DB.admin.media.mutations.updateMany(input),
      );
      if (mediaError) {
        console.error("[MEDIA UPDATE MANY] Error updating media", mediaError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update media",
          cause: mediaError,
        });
      }

      if (media.length === 0) {
        console.error("[MEDIA UPDATE MANY] No media returned");
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
      console.log("deleting media input", input);
      const media = await DB.admin.media.mutations.delete(
        input.id,
        input.ownerType,
      );
      console.log("deleted media", media);
      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        });
      }

      return media;
    }),
});
