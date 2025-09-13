import { useMutation } from "@tanstack/react-query";
import cuid from "cuid";
import type { Media } from "~/lib/schemas/media";
import { tryCatch } from "~/lib/utils/try-catch";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";

/**
 * Uploads multiple files to S3 using presigned URLs and updates their media status.
 *
 * @param files - Array of File objects to upload.
 * @param getPresignedUrls - Function to fetch presigned URLs for the files.
 * @param updateMedia - Function to update the media record after upload.
 * @throws Error if presigned URL retrieval or file upload fails.
 */
async function uploadFiles(
  files: File[],

  getPresignedUrls: (
    input: RouterInputs["admin"]["s3"]["getPresignedUrls"],
  ) => Promise<RouterOutputs["admin"]["s3"]["getPresignedUrls"]>,
  bulkUpdateMedia: (
    media: RouterInputs["admin"]["media"]["updateMany"],
  ) => Promise<RouterOutputs["admin"]["media"]["updateMany"]>,

  ownerType?: Media["ownerType"],
  ownerId?: Media["ownerId"],
) {
  // Map to associate fileId with its upload URL and mediaId
  const filesMap = new Map<string, { url: string; mediaId: number }>();

  // Request presigned URLs for all files
  const { data, error } = await tryCatch(
    getPresignedUrls(
      files.map((file) => {
        // Assign a unique fileId property to each file object
        const fileId = cuid(); // cuid to avoid collision with file names
        Object.defineProperty(file, "fileId", {
          value: fileId,
          configurable: true,
        });

        return {
          fileId,
          type: file.type,
          size: file.size,
        };
      }),
    ),
  );

  if (error) {
    throw new Error("Failed to get presigned url");
  }

  // Populate the fileMap with presigned URL and mediaId for each file
  data.forEach((item) => {
    filesMap.set(item.fileId, { url: item.url, mediaId: item.mediaId });
  });

  // Upload each file to S3 and update its media status
  const { error: fileUploadError } = await tryCatch(
    Promise.all(
      files.map(async (file) => {
        // Retrieve upload data for the current file
        const fileUploadData = filesMap.get(
          (file as File & { fileId: string }).fileId,
        );
        if (!fileUploadData) {
          // If no upload data found, skip this file
          return Promise.resolve();
        }

        // Upload the file to S3 using the presigned URL
        const { data: res, error: fileUploadResponseError } = await tryCatch(
          fetch(fileUploadData.url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          }),
        );
        if (fileUploadResponseError || !res.ok) {
          return Promise.reject(new Error("Failed to upload file"));
        }

        return Promise.resolve();
      }),
    ),
  );
  if (fileUploadError) {
    throw new Error("Failed to upload files");
  }

  const { error: bulkUpdateMediaError } = await tryCatch(
    bulkUpdateMedia(
      Array.from(filesMap.values()).map((value) => ({
        id: value.mediaId,
        status: "READY",
        ownerType,
        ownerId,
      })),
    ),
  );

  if (bulkUpdateMediaError) {
    throw new Error("Failed to update media");
  }
}

export interface UseUploadFilesMutationProps {
  files: File[];
  ownerType?: Media["ownerType"];
  ownerId?: Media["ownerId"];
}

/**
 * React Query mutation hook for uploading multiple files.
 *
 * - Uses the S3 getPresignedUrls mutation to get upload URLs.
 * - Uses the media update mutation to update media status after upload.
 * - Invalidates the media page cache on success.
 *
 * @returns Mutation object for uploading files.
 */
export function useUploadFilesMutation() {
  const utils = api.useUtils();
  const { mutateAsync: getPresignedUrls } =
    api.admin.s3.getPresignedUrls.useMutation();
  const { mutateAsync: bulkUpdateMedia } =
    api.admin.media.updateMany.useMutation();

  return useMutation({
    mutationFn: ({ files, ownerType, ownerId }: UseUploadFilesMutationProps) =>
      uploadFiles(files, getPresignedUrls, bulkUpdateMedia, ownerType, ownerId),
    onSuccess: () => {
      // Invalidate the media page cache after successful upload
      void utils.admin.media.getPage.invalidate();
    },
  });
}
