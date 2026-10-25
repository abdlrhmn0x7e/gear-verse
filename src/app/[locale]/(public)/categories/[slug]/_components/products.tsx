import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { MobileFiltersDrawer } from "~/components/features/products/mobile-filters-drawer";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProductList, ProductListSkeleton } from "./product-list";
import type {
  AttributeFilter,
  CategoryProductsFilters as NativeCategoryProductsFilters,
} from "./utils";
import type { CategoryProductsFilters } from "~/lib/schemas/contracts/public/categories";

export async function Products({
  slug,
  filters,
  filtersPanel,
}: {
  slug: string;
  filters: NativeCategoryProductsFilters;
  /** the filter panel, rendered again inside the mobile sheet */
  filtersPanel: React.ReactNode;
}) {
  const t = await getTranslations("products.listing");
  const attributeFilters = Array.from(Object.entries(filters)).reduce(
    (acc, [key, value]) => {
      if (value === null || value === undefined) return acc;

      if (
        key.startsWith("multi.") ||
        key.startsWith("select.") ||
        key.startsWith("bool.")
      ) {
        acc.push({
          type: key,
          value: value,
        } as unknown as AttributeFilter<"multi">); // any placeholder generic just to satisfy ts
      }

      return acc;
    },
    [] as CategoryProductsFilters["attributes"],
  );
  const parsedFilters = {
    brands: filters.brands ?? undefined,
    attributes: attributeFilters,
    // mirrors useCategoryProductsFilters so the prefetch matches the client query
    price: filters.maxPrice
      ? {
          min: filters.minPrice ?? 0,
          max: filters.maxPrice,
        }
      : undefined,
  } satisfies CategoryProductsFilters;

  void prefetch(
    trpc.public.categories.queries.getProductsPage.infiniteQueryOptions(
      {
        pageSize: 12,
        slug,
        filters: parsedFilters,
        locale: await getLocale(),
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <section aria-labelledby="products-heading" className="min-w-0 space-y-8">
      <h2 id="products-heading" className="sr-only">
        {t("heading")}
      </h2>
      <div className="lg:hidden">
        <MobileFiltersDrawer>{filtersPanel}</MobileFiltersDrawer>
      </div>

      <HydrateClient>
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList slug={slug} />
        </Suspense>
      </HydrateClient>
    </section>
  );
}

export async function ProductsSkeleton() {
  const t = await getTranslations("products.listing");
  return (
    <section aria-label={t("heading")}>
      <ProductListSkeleton />
    </section>
  );
}
