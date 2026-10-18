import { CheckCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { StarRating } from "~/components/features/reviews/star-rating";
import type { RouterOutput } from "~/trpc/client";
import { DeleteReviewDialog } from "./delete-review";

export type ProductReview =
  RouterOutput["admin"]["reviews"]["queries"]["findAll"][number];

export function Reviews({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-sm">No reviews yet.</p>;
  }

  return (
    <ul className="bg-input-background divide-y rounded-2xl">
      {reviews.map((review) => (
        <li key={review.id} className="flex items-start gap-3 p-4">
          <Avatar className="mt-0.5">
            <AvatarImage
              src={review.user?.image ?? undefined}
              alt={review.user?.name}
            />
            <AvatarFallback>{review.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">{review.user?.name}</span>
              {review.user?.verifiedPurchaser && (
                <Badge variant="success">
                  <CheckCircleIcon />
                  Verified purchaser
                </Badge>
              )}
            </div>
            <StarRating rating={review.rating} size="sm" />
            {review.comment && (
              <p className="text-muted-foreground mt-1 text-pretty">
                {review.comment}
              </p>
            )}
          </div>

          <DeleteReviewDialog id={review.id} />
        </li>
      ))}
    </ul>
  );
}
