import { api } from "~/trpc/server";
import { AddReview } from "./add-review";
import { Heading } from "~/components/heading";
import { CheckCircleIcon, MessageCircleOffIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { StarRating } from "./star-rating";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { EditReview } from "./edit-reviews";

export async function Reviews({ productId }: { productId: number }) {
  const reviews = await api.public.reviews.findAll({ productId });
  const data = await auth.api.getSession({
    headers: await headers(),
  });

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

                  {review.user?.id === Number(data?.user.id) && (
                    <EditReview review={review} productId={productId} />
                  )}
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
