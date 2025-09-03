import z from "zod";

export const mediaSchema = z.object({
  id: z.number(),

  ownerType: z.enum(["PRODUCT", "CATEGORY", "BRAND"]),
  ownerId: z.number(),

  url: z.url(),
  createdAt: z.coerce.date(),
});
export type Media = z.infer<typeof mediaSchema>;
