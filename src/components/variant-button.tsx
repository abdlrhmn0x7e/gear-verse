import { cn } from "~/lib/utils";
import { ImageWithFallback } from "./image-with-fallback";
import { type RouterOutput } from "~/trpc/client";

export function VariantButton({
  variant,
  className,
  ...props
}: {
  variant: NonNullable<
    RouterOutput["public"]["products"]["queries"]["findBySlug"]["variants"]
  >[number];
  className?: string;
} & React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "ring-primary focus-visible:ring-ring relative size-16 cursor-pointer rounded-md border transition-opacity hover:ring-2 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <ImageWithFallback
        src={variant.thumbnailUrl}
        alt={"Variant Image"}
        className="size-full"
        width={100}
        height={100}
      />
    </button>
  );
}
