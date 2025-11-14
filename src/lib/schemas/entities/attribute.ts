import z from "zod";

export const attributeTypeEnum = z.enum([
  "SELECT",
  "MULTISELECT",
  "RANGE",
  "BOOLEAN",
]);
export type AttributeType = z.infer<typeof attributeTypeEnum>;

export const attributeEntitySchema = z.object({
  id: z.number().positive(),

  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),

  type: attributeTypeEnum,

  updateAt: z.date(),
  createdAt: z.date(),
});
export type AttributeEntity = z.infer<typeof attributeEntitySchema>;

export const createAttributeInputSchema = attributeEntitySchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updateAt: true,
});
export type CreateAttributeInput = z.infer<typeof createAttributeInputSchema>;

export const updateAttributeInputSchema = createAttributeInputSchema.partial();
export type UpdateAttributeInput = z.infer<typeof updateAttributeInputSchema>;

export const connectCategoryAttributeInputSchema = z.object({
  attributeId: z.number(),
  categoryId: z.number(),
});
export type ConnectCategoryAttributeInput = z.infer<
  typeof connectCategoryAttributeInputSchema
>;
