import { useMutation } from "@tanstack/react-query";
import cuid from "cuid";
import type { Media, UpdateMediaDto } from "~/lib/schemas/media";
import { tryCatch } from "~/lib/utils/try-catch";
import { api } from "~/trpc/react";

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
    params: { fileId: string; type: string; size: number }[],
  ) => Promise<
    {
      url: string;
      key: string;
      fileId: string;
      accessUrl: string;
      mediaId: number;
    }[]
  >,
  updateMedia: (params: {
    id: number;
    data: UpdateMediaDto;
  }) => Promise<{ id: number } | undefined>,

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
        const { error: fileUploadResponseError } = await tryCatch(
          fetch(fileUploadData.url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          }),
        );
        if (fileUploadResponseError) {
          return Promise.reject(fileUploadResponseError);
        }

        // Update the media record status to "READY"
        const { error: updateMediaError } = await tryCatch(
          updateMedia({
            id: fileUploadData.mediaId,
            data: { status: "READY", ownerType, ownerId },
          }),
        );
        if (updateMediaError) {
          return Promise.reject(updateMediaError);
        }

        return Promise.resolve();
      }),
    ),
  );

  if (fileUploadError) {
    throw new Error("Failed to upload files");
  }
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
    api.s3.getPresignedUrls.useMutation();
  const { mutateAsync: updateMedia } = api.media.update.useMutation();

  return useMutation({
    mutationFn: ({
      files,
      ownerType,
      ownerId,
    }: {
      files: File[];
      ownerType?: Media["ownerType"];
      ownerId?: Media["ownerId"];
    }) => uploadFiles(files, getPresignedUrls, updateMedia, ownerType, ownerId),
    onSuccess: () => {
      // Invalidate the media page cache after successful upload
      void utils.media.getPage.invalidate();
    },
  });
}
