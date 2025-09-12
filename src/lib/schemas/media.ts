import z from "zod";

export const mediaOwnerTypeEnum = z.enum([
  "PRODUCT",
  "PRODUCT_VARIANT",
  "CATEGORY",
  "BRAND",
  "USER",
]);
export type MediaOwnerType = z.infer<typeof mediaOwnerTypeEnum>;

export const mediaSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  ownerType: mediaOwnerTypeEnum,
  ownerId: z
    .number("Owner ID must be a number")
    .nonnegative("Owner ID must be positive"),

  status: z.enum(["PENDING", "READY"], "Status is required"),

  url: z.url("URL is required"),
  createdAt: z.coerce.date("Created at must be a date"),
});
export type Media = z.infer<typeof mediaSchema>;
export type MediaAsset = Omit<Media, "status" | "ownerId" | "createdAt">;
export type NewMediaDto = Omit<Media, "id" | "createdAt" | "url">;
export type UpdateMediaDto = Partial<Omit<Media, "id" | "createdAt" | "url">>;
