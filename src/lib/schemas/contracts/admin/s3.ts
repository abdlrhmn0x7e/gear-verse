import { z } from "zod";
import { allowedMimeTypesEnum } from "./allowed-mime-types";

/** The biggest file an admin can upload, 10 MB. */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const s3GetPresignedUrlInputSchema = z.object({
  fileId: z.cuid("File ID is required"),
  name: z.string("Name is required"),
  // the client sends File.type, which is any string until it is checked here
  mimeType: z.string("Mime type is required").pipe(allowedMimeTypesEnum),
  // the presigned URL signs this as the content length, so the declared
  // size is the size S3 accepts
  size: z
    .number("Size is required")
    .int("Size must be a whole number of bytes")
    .positive("The file is empty")
    .max(MAX_UPLOAD_SIZE_BYTES, "Files can be up to 10 MB"),
});
export type S3GetPresignedUrlInput = z.infer<
  typeof s3GetPresignedUrlInputSchema
>;
