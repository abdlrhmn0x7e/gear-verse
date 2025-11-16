import { cacheTag } from "next/cache";
import { Suspense } from "react";
import {
  BrandFilterEmptyState,
  BrandFilterItem,
  ItemsSkeleton,
  PriceFilter,
  PriceFilterSkeleton,
} from "~/components/features/products/base-filter-items";
import {
  MobileBrandFilterItem,
  MobilePriceFilter,
} from "~/components/features/products/base-mobile-filter-items";
import { Heading } from "~/components/heading";
import { RadioGroup } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import { FilterItem } from "./filter-item";
import { ClearAllFiltersButton } from "./clear-all-filters-button";

export async function Filters({
  slug,
  isMobile = false,
}: {
  slug: string;
  isMobile?: boolean;
}) {
  "use cache";

  const [attributes, brands] = await Promise.all([
    api.public.categories.queries.getAttributes({
      slug,
    }),

    api.public.brands.queries.findAll({
      filters: {
        categorySlug: slug,
      },
    }),
  ]);

  cacheTag("category-filters", slug);

  return (
    <div className="flex flex-col gap-6 divide-y pb-8 [&>*:not(:last-child)]:pb-8">
      {attributes.length > 0 &&
        attributes.map((att) => {
          const WrapperElement = att.type === "SELECT" ? RadioGroup : "div";

          return (
            <WrapperElement
              key={`attribute-${att.name}`}
              className="gap-0 space-y-3"
            >
              {att.type !== "BOOLEAN" ? (
                <>
                  <Heading level={4}>{att.name}</Heading>
                  <div
                    className={cn(
                      "flex flex-col gap-4 p-1",
                      isMobile && "flex-row flex-wrap gap-2 p-0",
                    )}
                  >
                    {att.values.map((val) => (
                      <FilterItem
                        key={`${att.name}-${val.value}`}
                        label={val.value}
                        keyName={att.slug ?? "unknown-key"}
                        type={att.type ?? "MULTISELECT"}
                        value={val.slug}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <FilterItem
                  key={`${att.name}-switch`}
                  label={att.name ?? "Unknown Attribute"}
                  keyName={att.slug ?? "unknown-key"}
                  type={att.type ?? "MULTISELECT"}
                  isMobile={isMobile}
                />
              )}
            </WrapperElement>
          );
        })}

      <div className="space-y-4">
        <Heading level={4}>Brands</Heading>
        <div
          className={cn(
            "flex flex-col gap-4 p-1",
            isMobile && "flex-row flex-wrap gap-2",
          )}
        >
          <Suspense fallback={<ItemsSkeleton />}>
            {brands.length > 0 ? (
              brands.map((brand) =>
                isMobile ? (
                  <MobileBrandFilterItem
                    key={`brand-${brand.slug}`}
                    brand={brand}
                  />
                ) : (
                  <BrandFilterItem key={`brand-${brand.slug}`} brand={brand} />
                ),
              )
            ) : (
              <BrandFilterEmptyState />
            )}
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<PriceFilterSkeleton />}>
        {isMobile ? <MobilePriceFilter /> : <PriceFilter />}
      </Suspense>

      <ClearAllFiltersButton />
    </div>
  );
}
