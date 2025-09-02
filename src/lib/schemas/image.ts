import z from "zod";

export const imageSchema = z
  .file()
  .mime(["image/jpeg", "image/png", "image/gif", "image/webp"])
  .max(1024 * 1024 * 5);
