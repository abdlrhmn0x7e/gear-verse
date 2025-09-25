import { s3GetPresignedUrl } from "~/lib/s3";
import { adminProcedure, createTRPCRouter } from "../../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { s3GetPresignedUrlInputSchema } from "~/lib/schemas/contracts/admin/s3";
import { allowedMimeTypesEnum } from "~/lib/schemas/contracts/admin/allowed-mime-types";

export const s3Router = createTRPCRouter({
  /**
   * Mutations
   */
  getPresignedUrl: adminProcedure
    .input(s3GetPresignedUrlInputSchema)
    .mutation(async ({ input }) => {
      const { data, error } = await tryCatch(s3GetPresignedUrl(input));

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),

  getPresignedUrls: adminProcedure
    .input(z.array(s3GetPresignedUrlInputSchema))
    .mutation(async ({ input }) => {
      const allowedMimeTypesSchema = z.array(allowedMimeTypesEnum);
      if (
        allowedMimeTypesSchema.safeParse(input.map((item) => item.mimeType))
          .error
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid mime type",
        });
      }

      const { data: presignedUrls, error: presignedUrlsError } = await tryCatch(
        Promise.all(input.map((item) => s3GetPresignedUrl(item))),
      );

      if (presignedUrlsError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: presignedUrlsError.message,
        });
      }

      return presignedUrls;
    }),
});
