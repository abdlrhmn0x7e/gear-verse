import { cacheLife, cacheTag } from "next/cache";
import { app } from "~/server/application";

export type FeaturedReview = Awaited<
  ReturnType<typeof getFeaturedReviews>
>[number];

/**
 * Real reviews from across the store for the home page, and for products that have none of their own yet.
 * Writing, editing or deleting a review expires the "reviews" tag.
 */
export async function getFeaturedReviews(limit: number) {
  "use cache";

  cacheTag("reviews");
  cacheLife("days");

  return app.public.reviews.queries.findFeatured(limit);
}

/** "Omar Magdy" becomes "Omar M.": enough to read as a person without putting a full name on the home page. */
export function shortReviewerName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const lastInitial = rest.at(-1)?.[0];
  return lastInitial ? `${first} ${lastInitial.toUpperCase()}.` : (first ?? "");
}
