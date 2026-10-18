import { cacheTag } from "next/cache";
import {
  BrandFilterItem,
  FilterSection,
  NoBrandsFound,
  PriceFilter,
} from "~/components/features/products/base-filter-items";
import { RadioGroup } from "~/components/ui/radio-group";
import { app } from "~/server/application";
import { ClearAllFiltersButton } from "./clear-all-filters-button";
import { FilterItem } from "./filter-item";
import { SubCategoryFilterItem } from "./sub-category-filter-item";

export async function Filters({ slug }: { slug: string }) {
  "use cache";

  const [subCategories, attributes, brands, priceRange] = await Promise.all([
    app.public.categories.queries.getChildren(slug),
    app.public.categories.queries.getAttributes(slug),
    app.public.brands.queries.findAll({
      filters: {
        categorySlug: slug,
      },
    }),
    app.public.products.queries.getPriceRange({ categorySlug: slug }),
  ]);

  // the brands and the price range only count live products, which product edits change
  cacheTag("category-filters", slug, "recent-products");

  return (
    <div className="flex flex-col gap-10">
      {subCategories.length > 0 && (
        <FilterSection title="Narrow down">
          <div className="flex flex-wrap gap-2">
            {subCategories.map((category) => (
              <SubCategoryFilterItem key={category.slug} category={category} />
            ))}
          </div>
        </FilterSection>
      )}

      {attributes.map((att) =>
        att.type === "BOOLEAN" ? (
          <FilterItem
            key={att.name}
            label={att.name ?? "Unknown attribute"}
            keyName={att.slug ?? "unknown-key"}
            type="BOOLEAN"
          />
        ) : (
          <FilterSection key={att.name} title={att.name ?? "Attribute"}>
            {att.type === "SELECT" ? (
              <RadioGroup className="gap-3">
                {att.values.map((val) => (
                  <FilterItem
                    key={val.value}
                    label={val.value}
                    keyName={att.slug ?? "unknown-key"}
                    type="SELECT"
                    value={val.slug}
                  />
                ))}
              </RadioGroup>
            ) : (
              <div className="flex flex-wrap gap-2">
                {att.values.map((val) => (
                  <FilterItem
                    key={val.value}
                    label={val.value}
                    keyName={att.slug ?? "unknown-key"}
                    type="MULTISELECT"
                    value={val.slug}
                  />
                ))}
              </div>
            )}
          </FilterSection>
        ),
      )}

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
        <PriceFilter range={priceRange} />
      </FilterSection>

      <ClearAllFiltersButton />
    </div>
  );
}
