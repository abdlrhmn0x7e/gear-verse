import {
  ErrorCode,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";
import { toast } from "~/components/ui/toast";
import { MAX_UPLOAD_SIZE_BYTES } from "~/lib/schemas/contracts/admin/s3";

const REJECTION_REASONS: Partial<Record<string, string>> = {
  [ErrorCode.FileTooLarge]: "is over 10 MB",
  [ErrorCode.FileInvalidType]: "isn't a PNG, JPG or WebP image",
};

/** One toast per drop, naming the first file left out and why. */
function toastRejectedFiles(rejections: FileRejection[]) {
  const [first] = rejections;
  if (!first) return;

  const [error] = first.errors;
  const reason = error && REJECTION_REASONS[error.code];
  const why = reason ? ` ${reason}, so it` : "";
  const others = rejections.length - 1;
  const more =
    others > 0
      ? ` ${others} more file${others === 1 ? " wasn't" : "s weren't"} uploaded either.`
      : "";

  toast.error(`${first.file.name}${why} wasn't uploaded.${more}`);
}

/** The images the upload routes accept: the same types and size limit. */
export const imageDropzoneOptions = {
  accept: {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
  },
  maxSize: MAX_UPLOAD_SIZE_BYTES,
  onDropRejected: toastRejectedFiles,
} satisfies DropzoneOptions;
