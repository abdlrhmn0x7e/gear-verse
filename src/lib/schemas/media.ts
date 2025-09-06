import z from "zod";

export const mediaSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  ownerType: z.enum(["PRODUCT", "CATEGORY", "BRAND", "USER", "LISTING"]),
  ownerId: z
    .number("Owner ID must be a number")
    .nonnegative("Owner ID must be positive"),

  status: z.enum(["PENDING", "READY"], "Status is required"),

  url: z.url("URL is required"),
  createdAt: z.coerce.date("Created at must be a date"),
});
export type Media = z.infer<typeof mediaSchema>;
export type NewMediaDto = Omit<Media, "id" | "createdAt" | "url">;
export type UpdateMediaDto = Partial<Omit<Media, "id" | "createdAt" | "url">>;
