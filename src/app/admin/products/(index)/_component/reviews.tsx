import { CheckCircleIcon, MessageCircleOffIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { StarRating } from "~/components/features/reviews/star-rating";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { DeleteReviewDialog } from "./delete-review";
import { api } from "~/trpc/server";

export async function Reviews({ productId }: { productId: number }) {
  const reviews = await api.admin.reviews.queries.findAll({ productId });

  return (
    <div className="space-y-4">
      <Frame>
        <FrameHeader>
          <FrameTitle className="text-2xl font-semibold">
            User Reviews ({reviews.length})
          </FrameTitle>
        </FrameHeader>

        <FramePanel>
          <div className="flex flex-col gap-6 divide-y [&>*:not(:last-child)]:pb-6">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div
                  key={`${review.user?.name}-${review.rating}-${index}`}
                  className="flex items-start gap-3"
                >
                  <Avatar className="mt-1">
                    <AvatarImage
                      src={review.user?.image ?? undefined}
                      alt={review.user?.name}
                    />
                    <AvatarFallback>
                      {review.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full space-y-1">
                    <div className="flex w-full items-center justify-between gap-2">
                      <div>
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

                      <DeleteReviewDialog id={review.id} />
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
        </FramePanel>
      </Frame>
    </div>
  );
}
