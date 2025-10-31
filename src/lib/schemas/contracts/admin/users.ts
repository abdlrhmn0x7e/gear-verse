import z from "zod";
import { paginationSchema } from "../pagination";

export const usersGetPageInputSchema = paginationSchema.extend({
  filters: z
    .object({
      name: z.string().nullish(),
    })
    .optional(),
});
export type UsersGetPageInput = z.infer<typeof usersGetPageInputSchema>;
