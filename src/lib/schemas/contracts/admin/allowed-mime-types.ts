import z from "zod";

export const allowedMimeTypesEnum = z.enum(
  ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  "Invalid mime type",
);
