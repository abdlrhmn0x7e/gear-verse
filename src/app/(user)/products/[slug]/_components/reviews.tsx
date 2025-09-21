import { api } from "~/trpc/server";
import { AddReview } from "./add-review";
import { Heading } from "~/components/heading";
import { CheckCircleIcon, MessageCircleOffIcon, StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`size-4 ${
            star <= rating ? "fill-current text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export async function Reviews({ productId }: { productId: number }) {
  const reviews = await api.user.reviews.findAll({ productId });

  return (
    <div className="space-y-4">
      <AddReview productId={productId} />
      <Heading level={2}>User Reviews ({reviews.length})</Heading>
      <div>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={`${review.user?.name}-${review.rating}-${index}`}
              className="bg-card flex items-start gap-3 rounded-lg border p-4"
            >
              <Avatar className="mt-1">
                <AvatarImage
                  src={review.user?.image ?? undefined}
                  alt={review.user?.name}
                />
                <AvatarFallback>{review.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="">
                  <p className="space-x-1 font-medium">
                    <span>{review.user?.name} </span>
                    {review.user?.verifiedPurchaser && (
                      <Badge variant="success">
                        <CheckCircleIcon />
                        Verified Purchaser
                      </Badge>
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    <StarRating rating={review.rating} />{" "}
                    <span className="text-muted-foreground text-sm">
                      ({review.rating} stars)
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <MessageCircleOffIcon />
            <p className="text-muted-foreground text-lg">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
