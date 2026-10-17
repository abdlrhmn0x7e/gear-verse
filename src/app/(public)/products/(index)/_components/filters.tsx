import { cacheTag } from "next/cache";
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

  cacheTag("filters");

  const brands = await app.public.brands.queries.findAll();

  return (
    <div className="flex flex-col gap-10">
      <FilterSection title="Brand">
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

      <FilterSection title="Price">
        <PriceFilter />
      </FilterSection>

      <ClearAllFiltersButton />
    </div>
  );
}
