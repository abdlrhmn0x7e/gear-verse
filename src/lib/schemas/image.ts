import z from "zod";

export const imageSchema = z
  .file("Image is required")
  .mime(
    ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "Invalid image format",
  )
  .max(1024 * 1024 * 5, "Image must be less than 5MB");
