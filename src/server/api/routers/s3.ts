import { s3GetPresignedUrl } from "~/lib/s3";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { tryCatch } from "~/lib/utils/try-catch";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const s3Router = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        size: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("getPresignedUrl", input);
      const { data, error } = await tryCatch(
        s3GetPresignedUrl(input.type, input.size),
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),
});
