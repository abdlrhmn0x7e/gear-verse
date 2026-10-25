import { getCategoryCovers, getLatestProducts } from "../_lib/queries";
import { getDiscountPercentage } from "~/components/features/products/product-card";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { getLocale } from "next-intl/server";

/** The newest pick with the biggest saving, so the "worth the money" tile shows a real price rather than a claim. */
async function getFeaturedPick() {
  const products = await getLatestProducts();
  return [...products].sort(
    (a, b) =>
      getDiscountPercentage(b.price, b.strikeThroughPrice) -
      getDiscountPercentage(a.price, a.strikeThroughPrice),
  )[0];
}

/** Tiles step off the plum panel with a tint of its own text colour; their radius nests inside the panel's p-3. */
const tile = "bg-brand-solid-foreground/8 flex flex-col rounded-[1.25rem]";

/** Every tile and the header share one inner inset, so all text in the panel starts on the same edges. */
const inset = "px-5 sm:px-8";

/**
 * The page's one brand panel. Each pillar is a tile carrying its own proof: a real product and price, the actual
 * category shelf, the delivery time. One 12-column grid places the header and the tiles, so the intro sits over the
 * right-hand column it introduces. Plum carries the story, so nothing on it is a button.
 */
export async function WhyUs() {
  const locale = await getLocale();
  const [pick, covers] = await Promise.all([
    getFeaturedPick(),
    getCategoryCovers(),
  ]);

  return (
    <section
      id="why-us"
      className="py-12 md:py-16"
      aria-labelledby="why-us-heading"
    >
      <MaxWidthWrapper>
        <div className="bg-brand-solid text-brand-solid-foreground grid grid-cols-1 gap-3 rounded-[2rem] p-3 md:grid-cols-2 lg:grid-cols-12">
          <h2
            id="why-us-heading"
            className={cn(
              inset,
              "text-headline-sm md:text-headline lg:text-display-sm pt-7 text-balance md:col-span-2 md:pt-10 lg:col-span-7 lg:self-end lg:pt-12 lg:pb-8",
            )}
          >
            We pick, so you don&apos;t have to dig.
          </h2>
          <p
            className={cn(
              inset,
              "text-body-lg pb-4 text-pretty opacity-80 md:col-span-2 md:max-w-xl lg:col-span-5 lg:self-end lg:pt-12 lg:pb-9",
            )}
          >
            Most stores here either stock everything at a markup or carry the
            same thin selection. We keep a short list of gear we&apos;d stand
            behind.
          </p>

          {pick && (
            <div
              className={cn(tile, "md:col-span-2 lg:col-span-7 lg:row-span-2")}
            >
              <div
                className={cn(
                  inset,
                  "flex flex-col gap-5 pt-6 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:pt-8",
                )}
              >
                <div className="max-w-xs space-y-2">
                  <h3 className="text-title">Worth the money</h3>
                  <p className="text-pretty opacity-80">
                    If a product doesn&apos;t earn its price, it doesn&apos;t
                    make the shelf.
                  </p>
                </div>
                <p className="min-w-0 space-y-1 sm:max-w-72 sm:text-end">
                  <span className="flex flex-row-reverse items-baseline justify-end gap-2 tabular-nums sm:flex-row">
                    {pick.strikeThroughPrice &&
                      pick.strikeThroughPrice > pick.price && (
                        <s className="text-sm opacity-70">
                          <span className="sr-only">Was </span>
                          {formatCurrency(pick.strikeThroughPrice, locale)}
                        </s>
                      )}
                    <span className="text-headline-sm">
                      {formatCurrency(pick.price, locale)}
                    </span>
                  </span>
                  <span className="block truncate text-sm opacity-75">
                    {pick.title}
                  </span>
                </p>
              </div>
              <div className="image-well relative mx-2 mb-2 aspect-[4/3] flex-1 overflow-hidden rounded-[0.75rem] sm:aspect-[16/9] lg:aspect-auto lg:min-h-80">
                <ImageWithFallback
                  src={pick.thumbnailUrl}
                  alt={pick.title}
                  width={960}
                  height={960}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="absolute inset-0 size-full rounded-none border-none bg-transparent p-[8%] [&_img]:object-contain"
                />
              </div>
            </div>
          )}

          <div
            className={cn(
              tile,
              inset,
              "justify-between gap-6 py-6 sm:py-8 lg:col-span-5",
            )}
          >
            <div className="space-y-2">
              <h3 className="text-title">We&apos;ve got you</h3>
              <p className="text-pretty opacity-80">
                From stock in Egypt, and replaced if it arrives defective.
              </p>
            </div>
            <p className="text-display-sm tabular-nums">
              1–2 <span className="text-headline-sm opacity-75">days</span>
            </p>
          </div>

          <div
            className={cn(
              tile,
              inset,
              "justify-between gap-6 py-6 sm:py-8 lg:col-span-5",
            )}
          >
            <div className="space-y-2">
              <h3 className="text-title">Picked, not piled</h3>
              <p className="text-pretty opacity-80">
                A few good options per category, so you choose in minutes.
              </p>
            </div>
            {covers.length > 0 && (
              <ul
                className="grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] gap-3"
                aria-label="Categories"
              >
                {covers.slice(0, 3).map(({ category, product }) => (
                  <li key={category.slug} className="min-w-0 space-y-2">
                    <div className="image-well relative aspect-[4/3] overflow-hidden rounded-[0.75rem]">
                      <ImageWithFallback
                        src={product.thumbnailUrl}
                        alt=""
                        width={240}
                        height={240}
                        sizes="(min-width: 1024px) 10vw, 30vw"
                        className="absolute inset-0 size-full rounded-none border-none bg-transparent p-3 [&_img]:object-contain"
                      />
                    </div>
                    <p className="truncate text-sm opacity-80">
                      {category.name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
