import * as z from "zod";

export const brandSchema = z.object({
  id: z.number(),

  name: z.string().min(1),
  logoMediaId: z.number(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Brand = z.infer<typeof brandSchema>;
