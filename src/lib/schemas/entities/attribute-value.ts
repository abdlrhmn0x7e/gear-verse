import z from "zod";

export const attributeValueEntitySchema = z.object({
  id: z.number().positive(),

  attributeId: z.number().positive(),

  value: z.string(),
  slug: z.string(),

  createdAt: z.date(),
});
export type AttributeValueEntity = z.infer<typeof attributeValueEntitySchema>;

export const createAttributeValueInputSchema = attributeValueEntitySchema.omit({
  id: true,
  slug: true,
  createdAt: true,
});
export type CreateAttributeValueInput = z.infer<
  typeof createAttributeValueInputSchema
>;

export const updateAttributeValueInputSchema = createAttributeValueInputSchema
  .partial()
  .extend({
    attributeId: z.number(),
  });
export type UpdateAttributeValueInput = z.infer<
  typeof updateAttributeValueInputSchema
>;
