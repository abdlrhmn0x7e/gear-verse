import {
  CloudUploadIcon,
  MousePointerClickIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import type { MediaAsset, MediaOwnerType } from "~/lib/schemas/media";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface FileDropZoneProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  options?: DropzoneOptions;
  isLoading?: boolean;
  showFiles?: boolean;
  className?: string;
  initialFiles?: MediaAsset[];
}

export function FileDropzone({
  onChange,
  maxFiles,
  options = {},
  isLoading = false,
  showFiles = true,
  className,
  initialFiles,
}: FileDropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (
        maxFiles &&
        files.length + acceptedFiles.length + (initialFiles?.length ?? 0) >
          maxFiles
      ) {
        return;
      }

      onChange([...files, ...acceptedFiles]);
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [onChange, files, maxFiles, initialFiles],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDropAccepted,
    disabled: isLoading,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    ...options,
  });

  function handleRemoveFile(file: File) {
    setFiles((prev) => prev.filter((f) => f.name !== file.name));
    onChange(files.filter((f) => f.name !== file.name));
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "hover:bg-input/50 bg-input/40 flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center",
          isDragActive && "bg-input/60",
          ((maxFiles &&
            files.length + (initialFiles?.length ?? 0) >= maxFiles) ??
            isLoading) &&
            "pointer-events-none opacity-50",
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
        ) : isLoading ? (
          <>
            <Spinner size="page" />

            <p className="text-muted-foreground text-sm select-none">
              Uploading files...
            </p>
          </>
        ) : (
          <>
            <UploadIcon size={32} className="text-muted-foreground" />
            <p className="text-muted-foreground text-sm select-none">
              Drag and drop files here, or click to select files
            </p>
            <Button type="button" onClick={open}>
              <CloudUploadIcon />
              Click to select files
            </Button>
          </>
        )}
      </div>

      {showFiles && (
        <div
          className={cn(
            "grid grid-cols-2 items-start gap-4",
            maxFiles === 1 && "grid-cols-1",
          )}
        >
          {files.map((file, idx) => (
            <FileItem
              key={`file-${file.name}-${idx}`}
              file={file}
              handleRemoveFile={handleRemoveFile}
            />
          ))}

          {initialFiles &&
            initialFiles.length > 0 &&
            initialFiles.map((file, idx) => (
              <FileItemPreview
                key={`file-${file.url}-${idx}`}
                file={file}
                idx={idx}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function FileItemPreview({
  file,
  idx,
}: {
  file: { id: number; url: string; ownerType: MediaOwnerType };
  idx: number;
}) {
  const { mutate: deleteMedia, isPending: deletingMedia } =
    api.admin.media.delete.useMutation();
  const utils = api.useUtils();
  const router = useRouter();

  function handleRemoveFilePreview() {
    deleteMedia(
      { id: file.id, ownerType: file.ownerType },
      {
        onSuccess: () => {
          router.refresh();
          toast.success("Media deleted successfully");
          switch (file.ownerType) {
            case "PRODUCT":
            case "PRODUCT_VARIANT":
              void utils.admin.products.findById.invalidate();
              break;
            case "BRAND":
              void utils.admin.brands.getPage.invalidate();
              break;
            case "USER":
              void utils.admin.media.getPage.invalidate();
              break;
            default:
              break;
          }
        },
        onError: () => {
          toast.error("Failed to delete media");
        },
      },
    );
  }

  return (
    <div className="relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border p-px pr-2">
      <div className="relative z-10 flex items-center gap-2">
        <div className="bg-background relative size-12 shrink-0 overflow-hidden rounded-l-lg rounded-r-sm border">
          <Image
            src={file.url}
            alt={`Product Image ${idx + 1}`}
            width={100}
            height={100}
            className="size-full object-cover object-center"
          />
        </div>

        <p className="text-foreground text-sm font-medium">{`Product Image ${idx + 1}`}</p>
      </div>

      <Button
        variant="destructiveGhost"
        type="button"
        size="icon"
        className="relative z-10"
        onClick={handleRemoveFilePreview}
        disabled={deletingMedia}
      >
        {deletingMedia ? <Spinner /> : <TrashIcon />}
      </Button>

      <div className="bg-input/40 absolute inset-0" />
    </div>
  );
}

function FileItem({
  file,

  handleRemoveFile,
}: {
  file: File;

  handleRemoveFile: (file: File) => void;
}) {
  return (
    <div className="relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border p-px pr-2">
      <div className="relative z-10 flex items-center gap-2">
        <div className="bg-background relative size-12 shrink-0 overflow-hidden rounded-l-lg rounded-r-sm border">
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            width={100}
            height={100}
            className="size-full object-cover object-center"
          />
        </div>

        <div>
          <p className="text-foreground text-sm font-medium">{file.name}</p>
          <p className="text-muted-foreground text-sm">
            {file.size / 1024 > 1024
              ? Math.round(file.size / 1024 / 1024) + " MB"
              : Math.round(file.size / 1024) + " KB"}
          </p>
        </div>
      </div>

      <Button
        variant="destructiveGhost"
        type="button"
        size="icon"
        className="relative z-10"
        onClick={() => handleRemoveFile(file)}
      >
        <TrashIcon />
      </Button>

      <div className="bg-input/40 absolute inset-0" />
    </div>
  );
}
