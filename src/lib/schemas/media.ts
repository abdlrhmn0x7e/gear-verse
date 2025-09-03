import z from "zod";

export const mediaSchema = z.object({
  id: z.number(),

  ownerType: z.enum(["PRODUCT", "CATEGORY", "BRAND", "USER"]),
  ownerId: z.number(),

  status: z.enum(["PENDING", "READY"]),

  url: z.url(),
  createdAt: z.coerce.date(),
});
export type Media = z.infer<typeof mediaSchema>;
export type NewMediaDto = Omit<Media, "id" | "createdAt" | "url">;
export type UpdateMediaDto = Partial<Omit<Media, "id" | "createdAt" | "url">>;
