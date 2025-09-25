import z from "zod";

export const mediaOwnerTypeEnum = z.enum([
  "PRODUCT",
  "PRODUCT_VARIANT",
  "CATEGORY",
  "BRAND",
  "USER",
]);
export type MediaOwnerType = z.infer<typeof mediaOwnerTypeEnum>;

export const mediaEntitySchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  name: z.string("Name is required"),
  mimeType: z.string("Mime type is required"),
  url: z.url("URL is required"),

  createdAt: z.date("Created at must be a date"),
  updatedAt: z.date("Updated at must be a date"),
});
export type Media = z.infer<typeof mediaEntitySchema>;

export const createMediaInputSchema = mediaEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateMediaInput = z.infer<typeof createMediaInputSchema>;

export const updateMediaInputSchema = mediaEntitySchema
  .omit({
    createdAt: true,
  })
  .partial();
export type UpdateMediaInput = z.infer<typeof updateMediaInputSchema>;
