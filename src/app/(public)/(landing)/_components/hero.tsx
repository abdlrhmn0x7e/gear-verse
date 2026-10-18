import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "~/components/features/products/product-card";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { getLatestProducts } from "../_lib/queries";

export const HERO_PRODUCT_COUNT = 3;

export async function Hero() {
  const products = (await getLatestProducts()).slice(0, HERO_PRODUCT_COUNT);

  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16">
      <MaxWidthWrapper className="space-y-10 md:space-y-12">
        <div className="space-y-6">
          <h1 className="text-display-sm sm:text-[3.5rem] lg:text-display max-w-5xl text-balance">
            The world&apos;s best gear, finally in Egypt.
          </h1>

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <p className="text-muted-foreground text-body-lg max-w-xl text-pretty md:text-xl/relaxed">
              Rare gear from international brands, cleared through customs,
              insured and delivered to your door in 1–2 days.
            </p>
            <Button size="xl" asChild className="shrink-0">
              <Link href="/products">
                Shop the store
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>

        {products.length > 0 && (
          // a horizontal snap row on phones so the next card peeks, three columns from tablets up;
          // paint containment keeps the off-screen cards from widening the mobile layout viewport
          <ul className="no-scrollbar -mx-6 -my-2 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-2 [contain:paint] md:m-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0 md:[contain:none]">
            {products.map((product) => (
              <li
                key={product.id}
                className="w-[80vw] shrink-0 snap-start md:w-auto"
              >
                <ProductCard
                  product={product}
                  sizes="(min-width: 768px) 33vw, 80vw"
                />
              </li>
            ))}

            {/* a short catalog ends in a "see everything" tile, so the row never looks unfinished */}
            {products.length < HERO_PRODUCT_COUNT && (
              <li className="w-[80vw] shrink-0 snap-start md:w-auto">
                <Link
                  href="/products"
                  className="bg-card hover:bg-accent group flex aspect-square flex-col justify-between gap-8 rounded-3xl p-6 transition-[background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:p-8"
                >
                  <p className="text-title max-w-xs text-balance">
                    A curated store of the best international brands.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    See the whole store
                    <ArrowRightIcon
                      className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            )}
          </ul>
        )}
      </MaxWidthWrapper>
    </section>
  );
}
