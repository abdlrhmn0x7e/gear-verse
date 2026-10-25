import { Link } from "~/i18n/navigation";
import { StarRating } from "~/components/features/reviews/star-rating";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { getFeaturedReviews, shortReviewerName } from "~/lib/featured-reviews";
import { SectionHeader } from "./section-header";

/** Real product reviews only; the section stays hidden until customers have left some. */
export async function Testimonials() {
  const reviews = await getFeaturedReviews(4);
  if (reviews.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="testimonials-heading">
      <MaxWidthWrapper>
        <div className="bg-card space-y-12 rounded-[2rem] p-6 sm:p-12 lg:p-16">
          <SectionHeader
            id="testimonials-heading"
            title="What customers say"
            description="Reviews left on the gear they bought, unedited."
          />

          <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto *:w-[85%] *:shrink-0 *:snap-start md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:*:w-auto xl:grid-cols-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="bg-raised flex flex-col gap-5 rounded-3xl p-6"
              >
                <StarRating rating={review.rating} size="sm" />
                <blockquote
                  dir="auto"
                  className="text-body-lg leading-relaxed text-pretty"
                >
                  {review.comment}
                </blockquote>
                <p className="text-muted-foreground mt-auto text-sm">
                  {shortReviewerName(review.name)} on{" "}
                  <Link
                    href={`/products/${review.product.slug}`}
                    className="text-foreground underline decoration-from-font underline-offset-4"
                  >
                    {review.product.title}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
