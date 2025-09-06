import z from "zod";

export const listingSchema = z.object({
  id: z.number().nonnegative("ID must be positive"),

  title: z.string().min(1, "Title is required"),
  price: z.number().nonnegative("Price must be positive"),
  stock: z.number().nonnegative("Stock must be positive"),

  thumbnailMediaId: z
    .number()
    .nonnegative("Thumbnail media ID must be positive"),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Listing = z.infer<typeof listingSchema>;
