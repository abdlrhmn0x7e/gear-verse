import { useMutation } from "@tanstack/react-query";
import cuid from "cuid";
import type { Media } from "~/lib/schemas/media";
import { tryCatch } from "~/lib/utils/try-catch";
import { api, type RouterInputs, type RouterOutputs } from "~/trpc/react";

/**
 * Uploads a single file to S3 using a presigned URL and updates its media status.
 *
 * @param file - The File object to upload.
 * @param getPresignedUrl - Function to fetch a presigned URL for the file.
 * @param updateMedia - Function to update the media record after upload.
 * @returns An object containing the public access URL and mediaId.
 * @throws Error if presigned URL retrieval or file upload fails.
 */
async function uploadFile(
  file: File,

  getPresignedUrl: (
    input: RouterInputs["admin"]["s3"]["getPresignedUrl"],
  ) => Promise<RouterOutputs["admin"]["s3"]["getPresignedUrl"]>,
  updateMedia: (
    input: RouterInputs["admin"]["media"]["update"],
  ) => Promise<RouterOutputs["admin"]["media"]["update"]>,

  ownerType?: Media["ownerType"],
  ownerId?: Media["ownerId"],
) {
  // Request a presigned URL for the file
  const { data, error } = await tryCatch(
    getPresignedUrl({ fileId: cuid(), type: file.type, size: file.size }),
  );
  if (error) {
    throw new Error("Failed to get presigned url");
  }

  // Upload the file to S3 using the presigned URL
  const response = await fetch(data.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  // Update the media record status to "READY"
  await updateMedia({
    id: data.mediaId,
    data: { status: "READY", ownerType, ownerId },
  });

  // Return the public access URL and mediaId
  return { url: data.accessUrl, mediaId: data.mediaId };
}

export interface UseUploadFileMutationProps {
  file: File;
  ownerType?: Media["ownerType"];
  ownerId?: Media["ownerId"];
}

/**
 * React Query mutation hook for uploading a single file.
 *
 * - Uses the S3 getPresignedUrl mutation to get an upload URL.
 * - Uses the media update mutation to update media status after upload.
 * - Invalidates the media page cache on success.
 *
 * @returns Mutation object for uploading a file.
 */
export function useUploadFileMutation() {
  const utils = api.useUtils();
  const { mutateAsync: getPresignedUrl } =
    api.admin.s3.getPresignedUrl.useMutation();
  const { mutateAsync: updateMedia } = api.admin.media.update.useMutation();

  return useMutation({
    mutationFn: ({ file, ownerType, ownerId }: UseUploadFileMutationProps) =>
      uploadFile(file, getPresignedUrl, updateMedia, ownerType, ownerId),
    onSuccess: () => {
      // Invalidate the media page cache after successful upload
      void utils.admin.media.getPage.invalidate();
    },
  });
}
