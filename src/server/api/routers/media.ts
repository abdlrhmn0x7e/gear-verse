import { mediaSchema } from "~/lib/schemas/media";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { DB } from "~/server/repositories";
import z from "zod";
import { s3GetPublicUrl } from "~/lib/s3";
import { paginate } from "../helpers/pagination";
import { paginationSchema } from "~/lib/schemas/pagination";

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
    .mutation(({ input }) => {
      return DB.media.mutations.update(input.id, input.data);
    }),
  updateMany: adminProcedure
    .input(z.array(mediaSchema))
    .mutation(({ input }) => {
      return DB.media.mutations.updateMany(input);
    }),
});
