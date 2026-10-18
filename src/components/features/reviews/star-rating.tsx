import { StarIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export function StarRating({ rating }: { rating: number }) {
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
            "size-4",
            star <= rating
              ? "fill-foreground text-foreground"
              : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}
