import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { app } from "~/server/application";
import {
  BrandFilterItem,
  FilterSection,
  NoBrandsFound,
  PriceFilter,
} from "~/components/features/products/base-filter-items";
import { ClearAllFiltersButton } from "./clear-all-filters-button";

/** Brand and price filters; categories live in the chips row above the grid. */
export async function Filters() {
  "use cache";

  // the brands and the price range only count live products, which product edits change
  cacheTag("filters", "recent-products");

  const [brands, priceRange, t] = await Promise.all([
    app.public.brands.queries.findAll(),
    app.public.products.queries.getPriceRange(),
    getTranslations("products.filters"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <FilterSection title={t("brand")}>
        {brands.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <BrandFilterItem key={brand.slug} brand={brand} />
            ))}
          </div>
        ) : (
          <NoBrandsFound />
        )}
      </FilterSection>

      <FilterSection title={t("price")}>
        <PriceFilter range={priceRange} />
      </FilterSection>

      <ClearAllFiltersButton />
    </div>
  );
}
