import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateMediaDto } from "~/lib/schemas/media";
import { tryCatch } from "~/lib/utils/try-catch";
import { api } from "~/trpc/react";

async function uploadFile(
  file: File,
  getPresignedUrl: (params: { type: string; size: number }) => Promise<{
    url: string;
    key: string;
    accessUrl: string;
    mediaId: number;
  }>,
  updateMedia: (params: {
    id: number;
    data: UpdateMediaDto;
  }) => Promise<{ id: number } | undefined>,
) {
  const { data, error } = await tryCatch(
    getPresignedUrl({ type: file.type, size: file.size }),
  );
  if (error) {
    throw new Error("Failed to get presigned url");
  }

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

  await updateMedia({ id: data.mediaId, data: { status: "READY" } });

  return { url: data.accessUrl, mediaId: data.mediaId };
}

export function useUploadFileMutation() {
  const utils = api.useUtils();
  const { mutateAsync: getPresignedUrl } = api.s3.getPresignedUrl.useMutation();
  const { mutateAsync: updateMedia } = api.media.update.useMutation();

  return useMutation({
    mutationFn: ({ file }: { file: File }) =>
      uploadFile(file, getPresignedUrl, updateMedia),
    onSuccess: () => {
      void utils.media.getPage.invalidate();
    },
  });
}
