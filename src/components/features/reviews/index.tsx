import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { LoginDrawerDialog } from "~/components/login-drawer-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { app } from "~/server/application";
import { getSession } from "~/server/auth";
import { getFeaturedReviews, shortReviewerName } from "~/lib/featured-reviews";
import { AddReview } from "./add-review";
import { DeleteReviewDialog } from "./delete-review";
import { EditReview } from "./edit-reviews";
import { StarRating } from "./star-rating";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// a snap row on phones so the next card peeks (like the home hero), three columns from tablets up
const cardRowClassName =
  "no-scrollbar -mx-6 -my-2 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-2 [contain:paint] md:m-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0 md:[contain:none]";
const cardClassName =
  "bg-card flex min-h-72 w-[80vw] shrink-0 snap-start flex-col gap-6 rounded-3xl p-6 md:w-auto md:p-8";

export async function Reviews({ productId }: { productId: number }) {
  const reviews = await app.public.reviews.queries.findAll(productId);
  const data = await getSession();
  const userHasReviewed = reviews.some(
    (review) => review.user?.id === Number(data?.user.id),
  );
  // a product without reviews borrows real ones from other gear, labelled as such, so the section still reassures
  const otherReviews = reviews.length === 0 ? await getFeaturedReviews(3) : [];
  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="flex flex-col gap-10 md:gap-12"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 id="reviews-heading" className="text-headline-sm text-balance">
          What customers are saying
        </h2>
        {reviews.length > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-title tabular-nums">
              {average.toFixed(1)}
            </span>
            <StarRating rating={Math.round(average)} />
            <span className="text-muted-foreground text-sm">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-pretty">
            {otherReviews.length > 0
              ? "No reviews for this product yet. Here's what customers said about other gear from us."
              : "No reviews for this product yet."}
          </p>
        )}
      </div>

      {reviews.length > 0 ? (
        <ul className={cardRowClassName}>
          {reviews.map((review) => (
            <li key={review.id} className={cardClassName}>
              <div className="flex items-center justify-between gap-2">
                <StarRating rating={review.rating} size="sm" />
                {review.user?.id === Number(data?.user.id) && (
                  <div className="-my-2 -me-2 flex items-center">
                    <EditReview review={review} productId={productId} />
                    <DeleteReviewDialog id={review.id} />
                  </div>
                )}
              </div>

              <blockquote
                dir="auto"
                className="text-muted-foreground text-body-lg leading-relaxed text-pretty"
              >
                {review.comment}
              </blockquote>

              <div className="mt-auto flex flex-col gap-1.5">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
                  {review.user?.name}
                  {review.user?.verifiedPurchaser && (
                    <Badge variant="success">
                      <CheckCircleIcon />
                      Verified purchase
                    </Badge>
                  )}
                </p>
                <time
                  dateTime={new Date(review.createdAt).toISOString()}
                  className="text-muted-foreground text-sm"
                >
                  {dateFormat.format(review.createdAt)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        otherReviews.length > 0 && (
          <ul className={cardRowClassName}>
            {otherReviews.map((review) => (
              <li key={review.id} className={cardClassName}>
                <StarRating rating={review.rating} size="sm" />
                <blockquote
                  dir="auto"
                  className="text-muted-foreground text-body-lg leading-relaxed text-pretty"
                >
                  {review.comment}
                </blockquote>
                <p className="mt-auto font-medium">
                  {shortReviewerName(review.name)}{" "}
                  <span className="text-muted-foreground font-normal">
                    on{" "}
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="text-foreground underline decoration-from-font underline-offset-4"
                    >
                      {review.product.title}
                    </Link>
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )
      )}

      {data && !userHasReviewed && (
        <div className="self-center">
          <AddReview productId={productId} />
        </div>
      )}

      {!data && (
        <p className="text-muted-foreground self-center text-sm">
          <LoginDrawerDialog>
            <Button
              variant="link"
              className="text-foreground h-auto border-0 p-0 align-baseline underline"
            >
              Sign in
            </Button>
          </LoginDrawerDialog>{" "}
          to review this product.
        </p>
      )}
    </section>
  );
}
