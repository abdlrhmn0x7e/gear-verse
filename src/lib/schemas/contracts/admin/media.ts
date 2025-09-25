import z from "zod";
import { paginationSchema } from "../pagination";

export const mediaFilterSchema = z
  .object({
    name: z.string(),
  })
  .partial();
export type MediaFilter = z.infer<typeof mediaFilterSchema>;

export const mediaGetPageInputSchema = paginationSchema.extend({
  filters: mediaFilterSchema.optional(),
});
export type MediaGetPageInput = z.infer<typeof mediaGetPageInputSchema>;
