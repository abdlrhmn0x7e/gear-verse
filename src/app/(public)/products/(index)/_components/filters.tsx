import { cacheTag } from "next/cache";
import { Suspense } from "react";
import { Heading } from "~/components/heading";
import { Card, CardContent } from "~/components/ui/card";

import { app } from "~/server/application";
import {
  BrandFilterItem,
  CategoryFilterItem,
  ItemsSkeleton,
  PriceFilter,
  PriceFilterSkeleton,
} from "~/components/features/products/base-filter-items";
import {
  BrandFilterEmptyState,
  CategoryFilterEmptyState,
} from "~/components/features/products/base-filter-items";
import { ClearAllFiltersButton } from "./clear-all-filters-button";

export async function Filters() {
  "use cache";

  const categoriesPromise = app.public.categories.queries.findRoots();
  const brandsPromise = app.public.brands.queries.findAll();

  const [categories, brands] = await Promise.all([
    categoriesPromise,
    brandsPromise,
  ]);

  cacheTag("filters");

  return (
    <aside id="filters" className="hidden lg:block">
      <Card className="p-4">
        <CardContent className="p-0 pb-4">
          <div className="flex flex-col gap-6 divide-y [&>*:not(:last-child)]:pb-8">
            <div className="flex flex-col gap-4">
              <Heading level={4}>Categories</Heading>

              <Suspense fallback={<ItemsSkeleton />}>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <CategoryFilterItem
                      key={`category-${category.slug}`}
                      category={category}
                    />
                  ))
                ) : (
                  <CategoryFilterEmptyState />
                )}
              </Suspense>
            </div>

            <div className="flex flex-col gap-4">
              <Heading level={4}>Brands</Heading>
              <Suspense fallback={<ItemsSkeleton />}>
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <BrandFilterItem
                      key={`brand-${brand.slug}`}
                      brand={brand}
                    />
                  ))
                ) : (
                  <BrandFilterEmptyState />
                )}
              </Suspense>
            </div>

            <Suspense fallback={<PriceFilterSkeleton />}>
              <PriceFilter />
            </Suspense>

            <Suspense>
              <ClearAllFiltersButton />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
