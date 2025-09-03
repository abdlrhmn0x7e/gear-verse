import { useMutation } from "@tanstack/react-query";
import { tryCatch } from "~/lib/utils/try-catch";
import { api } from "~/trpc/react";

async function uploadFile(
  file: File,
  getPresignedUrl: ({
    type,
    size,
  }: {
    type: string;
    size: number;
  }) => Promise<{ url: string; key: string; accessUrl: string }>,
) {
  console.log("file", file);
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

  return { url: data.accessUrl };
}

export function useUploadFileMutation() {
  const { mutateAsync: getPresignedUrl } = api.s3.getPresignedUrl.useMutation();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file, getPresignedUrl),
  });
}
