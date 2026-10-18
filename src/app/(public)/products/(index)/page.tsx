import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryChips } from "~/components/features/products/category-chips";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { pageMetadata } from "~/lib/seo/metadata";
import { Filters } from "./_components/filters";
import { Products, ProductsSkeleton } from "./_components/products";

const TITLE = "Shop Imported Gaming Gear in Egypt";

// filtered and sorted URLs get noindex from the proxy and canonicalise here
export const metadata: Metadata = {
  title: TITLE,
  ...pageMetadata({
    title: TITLE,
    description:
      "Hand-imported keyboards, mice, IEMs and webcams from AKKO, SIMGOT and more. Prices in EGP, cash on delivery across Egypt.",
    path: "/products",
  }),
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          Store
        </h1>
        <p className="text-muted-foreground text-body-lg text-pretty">
          Hand-imported gear from international brands, in stock and ready to
          ship in Egypt.
        </p>
      </header>

      <div className="mt-8">
        <CategoryChips activeSlug={null} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24">
            <Suspense>
              <Filters />
            </Suspense>
          </div>
        </aside>

        <Suspense fallback={<ProductsSkeleton />}>
          <Products searchParams={searchParams} filters={<Filters />} />
        </Suspense>
      </div>
    </MaxWidthWrapper>
  );
}
