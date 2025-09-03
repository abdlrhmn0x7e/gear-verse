import { mediaSchema } from "~/lib/schemas/media";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DB } from "~/server/repositories";
import z from "zod";
import { s3GetPublicUrl } from "~/lib/s3";

export const mediaRouter = createTRPCRouter({
  /**
   * Mutations
   */
  create: protectedProcedure
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
});
