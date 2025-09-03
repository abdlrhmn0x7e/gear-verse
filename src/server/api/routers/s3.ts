import { s3GetPresignedUrl } from "~/lib/s3";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { DB } from "~/server/repositories";

export const s3Router = createTRPCRouter({
  /**
   * Mutations
   */
  getPresignedUrl: adminProcedure
    .input(
      z.object({
        fileId: z.string(),
        type: z.string(),
        size: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await tryCatch(
        s3GetPresignedUrl(input.type, input.size, input.fileId),
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
          url: data.accessUrl,
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

  getPresignedUrls: adminProcedure
    .input(
      z.array(
        z.object({
          fileId: z.string(),
          type: z.string(),
          size: z.number(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      const returnedData = new Map<
        string,
        {
          key: string;
          url: string;
          fileId: string;
          accessUrl: string;
          mediaId: number;
        }
      >();
      const { data: presignedUrls, error: presignedUrlsError } = await tryCatch(
        Promise.all(
          input.map((item) =>
            s3GetPresignedUrl(item.type, item.size, item.fileId),
          ),
        ),
      );

      if (presignedUrlsError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: presignedUrlsError.message,
        });
      }

      const { data: media, error: mediaError } = await tryCatch(
        DB.media.mutations.createMany(
          presignedUrls.map((item) => ({
            ownerType: "USER",
            ownerId: Number(ctx.session.user.id),
            url: item.accessUrl,
          })),
        ),
      );

      if (mediaError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: mediaError.message,
        });
      }

      presignedUrls.forEach((item) => {
        returnedData.set(item.accessUrl, {
          ...item,
          mediaId: 0,
        });
      });

      media.forEach((mediaItem) => {
        const entry = returnedData.get(mediaItem.url);
        if (!entry) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Media not found",
          });
        }
        returnedData.set(mediaItem.url, {
          ...entry,
          mediaId: mediaItem.id,
        });
      });

      return Array.from(returnedData.values());
    }),
});
