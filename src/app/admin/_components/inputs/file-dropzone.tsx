"use client";

import {
  CloudUploadIcon,
  MousePointerClickIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useCallback } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useUploadFilesMutation } from "~/hooks/mutations/use-upload-files-mutations";
import type { SelectedMedia } from "../../_stores/media/store";
import { MediaDialog } from "../dialogs/media";
import { useMediaStore } from "../../_stores/media/provider";
import { ImageWithFallback } from "~/components/image-with-fallback";

export interface FileDropZoneProps {
  options?: DropzoneOptions;
  className?: string;
  onChange?: (media: SelectedMedia[]) => void;
  value?: SelectedMedia[];
  showFiles?: boolean;
}

export function FileDropzone({
  options = {},
  value,
  onChange,
  className,
  showFiles = false,
}: FileDropZoneProps) {
  const { mutate: uploadFiles, isPending } = useUploadFilesMutation();
  const selectedMedia = useMediaStore((state) => state.selectedMedia);
  const addSelectedMedia = useMediaStore((state) => state.addSelectedMedia);
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);
  const maxFiles = useMediaStore((state) => state.maxFiles);
  const deleteSelectedMedia = useMediaStore(
    (state) => state.deleteSelectedMedia,
  );
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      uploadFiles(acceptedFiles, {
        onSuccess: (data) => {
          addSelectedMedia(
            data.map((file) => ({
              mediaId: file.id,
              url: file.url,
            })),
          );
          onChange?.(
            data.map((file, index) => ({
              mediaId: file.id,
              url: file.url,
              order: index,
            })),
          );
        },
      });
    },
    [onChange, uploadFiles, addSelectedMedia],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDropAccepted,
    disabled: isPending,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    noClick: true,
    ...options,
  });

  function handleDelete(mediaId: number) {
    deleteSelectedMedia(mediaId);
    onChange?.(selectedMedia.filter((media) => media.mediaId !== mediaId));
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "hover:bg-input/30 bg-input/20 flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border-1 border-dashed p-4 text-center transition-colors duration-100",
          maxFiles &&
            selectedMedia.length >= maxFiles &&
            "pointer-events-none opacity-50",
          isDragActive && "bg-input/60",
          isPending && "pointer-events-none opacity-50",
          className,
        )}
        {...getRootProps()}
      >
        {/*
					This input has it's own state away from any
					external state which could be a problem
				*/}
        <input {...getInputProps()} />

        {isDragActive ? (
          <>
            <MousePointerClickIcon
              size={32}
              className="text-muted-foreground"
            />

            <p className="text-muted-foreground text-sm select-none">
              Drop files here to upload
            </p>
          </>
        ) : isPending ? (
          <>
            <Spinner size="page" />

            <p className="text-muted-foreground text-sm select-none">
              Uploading files...
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <UploadCloudIcon size={16} className="text-muted-foreground" />

              <p className="text-muted-foreground text-sm select-none">
                Drag and drop files here, click to select files
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button type="button" size="sm" onClick={open}>
                <CloudUploadIcon />
                Click to select files
              </Button>

              <MediaDialog onChange={onChange}>
                <Button type="button" variant="link" size="sm">
                  Select existing
                </Button>
              </MediaDialog>
            </div>
          </div>
        )}
      </div>

      {showFiles && (
        <div className="flex flex-wrap gap-2">
          {selectedMedia.map((media, index) => (
            <div key={`media-${media.mediaId}-${index}`} className="relative">
              <ImageWithFallback
                src={media.url}
                alt={media.url}
                className="size-16"
                width={128}
                height={128}
              />
              <button
                className="bg-muted absolute -top-1 -right-1 flex size-5 cursor-pointer items-center justify-center rounded-full border [&>svg]:size-3"
                onClick={() => handleDelete(media.mediaId)}
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
