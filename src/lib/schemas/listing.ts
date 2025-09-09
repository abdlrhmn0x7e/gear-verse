import z from "zod";

export const listingSchema = z.object({
  id: z.number("ID must be a number").nonnegative("ID must be positive"),

  title: z.string("Title is required").min(1, "Title is required"),
  summary: z
    .string("Summary is required")
    .min(1, "Summary is required")
    .max(255, "Summary must be less than 255 characters"),
  description: z
    .string("Description is required")
    .min(1, "Description is required"),
  price: z
    .string("Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a number"),
  stock: z.coerce
    .number("Stock must be a number")
    .nonnegative("Stock must be positive"),

  thumbnailMediaId: z
    .number("Thumbnail media ID must be a number")
    .nonnegative("Thumbnail media ID must be positive"),

  createdAt: z.coerce.date("Created at must be a date"),
  updatedAt: z.coerce.date("Updated at must be a date"),
});
export type Listing = z.infer<typeof listingSchema>;
