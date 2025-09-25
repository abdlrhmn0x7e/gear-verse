import { z } from "zod";

export const s3GetPresignedUrlInputSchema = z.object({
  fileId: z.cuid("File ID is required"),
  name: z.string("Name is required"),
  mimeType: z.string("Mime type is required"),
  size: z.number("Size is required"),
});
export type S3GetPresignedUrlInput = z.infer<
  typeof s3GetPresignedUrlInputSchema
>;
