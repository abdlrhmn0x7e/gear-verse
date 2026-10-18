import { AddReview } from "./add-review";
import { CheckCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { LoginDrawerDialog } from "~/components/login-drawer-dialog";
import { StarRating } from "./star-rating";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { EditReview } from "./edit-reviews";
import { app } from "~/server/application";
import { DeleteReviewDialog } from "./delete-review";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function Reviews({ productId }: { productId: number }) {
  const reviews = await app.public.reviews.queries.findAll(productId);
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  const userHasReviewed = reviews.some(
    (review) => review.user?.id === Number(data?.user.id),
  );
  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @4xl:gap-16"
    >
      <div className="flex flex-col gap-3">
        <h2 id="reviews-heading" className="text-headline-sm text-balance">
          Reviews
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-title tabular-nums">
              {average.toFixed(1)}
            </span>
            <StarRating rating={Math.round(average)} />
            <span className="text-muted-foreground text-sm">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {data && !userHasReviewed && <AddReview productId={productId} />}

        {!data && (
          <p className="text-muted-foreground text-sm">
            <LoginDrawerDialog>
              <Button
                variant="link"
                className="h-auto border-0 p-0 align-baseline underline"
              >
                Sign in
              </Button>
            </LoginDrawerDialog>{" "}
            to review this product.
          </p>
        )}

        {reviews.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="bg-card flex flex-col gap-4 rounded-3xl p-6"
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={review.user?.image ?? undefined} alt="" />
                    <AvatarFallback>
                      {review.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      {review.user?.name}
                      {review.user?.verifiedPurchaser && (
                        <Badge variant="success">
                          <CheckCircleIcon />
                          Verified purchase
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <time
                        dateTime={new Date(review.createdAt).toISOString()}
                        className="text-muted-foreground text-xs"
                      >
                        {dateFormat.format(review.createdAt)}
                      </time>
                    </div>
                  </div>

                  {review.user?.id === Number(data?.user.id) && (
                    <div className="-mt-1.5 -mr-2 flex items-center">
                      <EditReview review={review} productId={productId} />
                      <DeleteReviewDialog id={review.id} />
                    </div>
                  )}
                </div>

                <p className="text-pretty">{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}
      </div>
    </section>
  );
}
