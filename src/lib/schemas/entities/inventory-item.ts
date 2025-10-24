import z from "zod";

export const inventoryItemSchema = z.object({
  id: z
    .number("ID must be a number")
    .positive("ID is required and must be positive"),
  productId: z
    .number("Product ID must be a number")
    .positive("Product ID is required and must be positive"),
  productVariantId: z
    .number("Product Variant ID must be a number")
    .positive("Product Variant ID is required and must be positive")
    .nullish(),
  quantity: z.coerce
    .number<number>("Quantity must be a number")
    .nonnegative("Quantity is required and must be non-negative"),

  createdAt: z.coerce.date<Date>("Created at must be a date"),
  updatedAt: z.coerce.date<Date>("Updated at must be a date"),
});
export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const createInventoryItemInputSchema = inventoryItemSchema.omit({
  productId: true,
  productVariantId: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateInventoryItemInput = z.infer<
  typeof createInventoryItemInputSchema
>;

export const updateInventoryItemInputSchema = inventoryItemSchema
  .omit({
    id: true,
    productId: true,
    productVariantId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .extend({
    id: z
      .number("ID must be a number")
      .positive("ID is required and must be positive"),
  });
export type UpdateInventoryItemInput = z.infer<
  typeof updateInventoryItemInputSchema
>;

export const updateManyInventoryItemsInputSchema = z.object({
  inventory: createInventoryItemInputSchema.array(),
});
export type UpdateManyInventoryItemsInput = z.infer<
  typeof updateManyInventoryItemsInputSchema
>;
