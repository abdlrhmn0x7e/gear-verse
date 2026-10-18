import { z } from "zod";
import { allowedMimeTypesEnum } from "./allowed-mime-types";

export const s3GetPresignedUrlInputSchema = z.object({
  fileId: z.cuid("File ID is required"),
  name: z.string("Name is required"),
  // the client sends File.type, which is any string until it is checked here
  mimeType: z.string("Mime type is required").pipe(allowedMimeTypesEnum),
  size: z.number("Size is required"),
});
export type S3GetPresignedUrlInput = z.infer<
  typeof s3GetPresignedUrlInputSchema
>;
