import { s3GetPresignedUrl, s3GetPublicUrl } from "~/lib/s3";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { DB } from "~/server/repositories";

export const s3Router = createTRPCRouter({
  /**
   * Queries
   */
  getPresignedUrl: adminProcedure
    .input(
      z.object({
        type: z.string(),
        size: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await tryCatch(
        s3GetPresignedUrl(input.type, input.size),
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      // Create a new media record
      const { data: media, error: mediaError } = await tryCatch(
        DB.media.mutations.create({
          ownerType: "USER",
          ownerId: Number(ctx.session.user.id),
          url: s3GetPublicUrl(data.key),
        }),
      );

      if (mediaError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: mediaError.message,
        });
      }

      if (!media) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create media record",
        });
      }

      return {
        ...data,
        mediaId: media.id,
      };
    }),
});
