import { useMutation } from "@tanstack/react-query";
import cuid from "cuid";
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
  createMedia: (
    input: RouterInputs["admin"]["media"]["mutations"]["createMany"],
  ) => Promise<RouterOutputs["admin"]["media"]["mutations"]["createMany"]>,
) {
  const fileObjects = files.map((file) => ({
    file,
    fileId: cuid(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
  }));
  const input = fileObjects.map((fileObject) => ({
    ...fileObject,
    file: undefined,
  }));
  const presignedUrls = await getPresignedUrls(input);

  await Promise.all(
    presignedUrls.map((presignedUrl) => {
      const fileObject = fileObjects.find(
        (fileObject) => fileObject.fileId === presignedUrl.fileId,
      );
      if (!fileObject) {
        throw new Error("File not found");
      }

      return fetch(presignedUrl.url, {
        method: "PUT",
        body: fileObject.file,
        headers: {
          "Content-Type": fileObject.mimeType,
        },
      });
    }),
  );

  const media = await createMedia(
    presignedUrls.map((presignedUrl) => ({
      name: presignedUrl.name,
      mimeType: presignedUrl.mimeType,
      url: presignedUrl.accessUrl,
    })),
  );

  return media;
}

export interface UseUploadFilesMutationProps {
  files: File[];
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
  const { mutateAsync: createMedia } =
    api.admin.media.mutations.createMany.useMutation();

  return useMutation({
    mutationFn: (files: File[]) =>
      uploadFiles(files, getPresignedUrls, createMedia),
    onSuccess: () => {
      void utils.admin.media.queries.getPage.invalidate();
    },
  });
}
