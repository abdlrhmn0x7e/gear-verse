import {
  CloudUploadIcon,
  MousePointerClickIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function FileDropzone({
  onChange,
  maxFiles,
  options = {},
  isLoading = false,
  showFiles = true,
  className,
}: {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  options?: DropzoneOptions;
  isLoading?: boolean;
  showFiles?: boolean;
  className?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (maxFiles && files.length + acceptedFiles.length > maxFiles) {
        return;
      }

      onChange([...files, ...acceptedFiles]);
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [onChange, files, maxFiles],
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
          ((maxFiles && files.length >= maxFiles) ?? isLoading) &&
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

      {files.length > 0 && showFiles && (
        <div
          className={cn(
            "grid grid-cols-2 items-start gap-4",
            maxFiles === 1 && "grid-cols-1",
          )}
        >
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className={cn(
                "relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border p-px pr-2",
                files.length % 2 === 1 &&
                  files.length - 1 === idx &&
                  "col-span-2",
              )}
            >
              <div className="relative z-10 flex items-center gap-2">
                <div className="bg-background relative size-12 shrink-0 overflow-hidden rounded-l-lg rounded-r-sm border">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    width={100}
                    height={100}
                    className="object-cover object-center"
                  />
                </div>

                <div>
                  <p className="text-foreground text-sm font-medium">
                    {file.name}
                  </p>
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
          ))}
        </div>
      )}
    </div>
  );
}
