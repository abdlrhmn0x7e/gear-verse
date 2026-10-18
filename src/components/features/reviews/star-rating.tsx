import { StarIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export function StarRating({
  rating,
  size = "default",
}: {
  rating: number;
  size?: "sm" | "default";
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          aria-hidden
          strokeWidth={1.5}
          className={cn(
            size === "sm" ? "size-3.5" : "size-4",
            star <= rating
              ? "fill-rating text-rating-edge"
              : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}
