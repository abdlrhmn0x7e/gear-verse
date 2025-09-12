import { ImageOffIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { SuspendableImage } from "./suspendable-image";

export function ImageWithFallback({
  src,
  alt,
  className,
  ...props
}: {
  src?: string | null;
  alt: string;
  className?: string;
} & Omit<React.ComponentProps<typeof SuspendableImage>, "src" | "alt">) {
  if (!src) {
    return (
      <div
        className={cn("size-8 overflow-hidden rounded-sm border", className)}
      >
        <ImageOffIcon className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("size-8 overflow-hidden rounded-sm border", className)}>
      <SuspendableImage src={src} alt={alt} {...props} />
    </div>
  );
}
