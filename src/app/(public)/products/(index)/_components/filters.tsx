import { Heading } from "~/components/heading";
import { FolderXIcon, PackageOpenIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Card, CardContent } from "~/components/ui/card";
import {
  CategoryFilterItem,
  BrandFilterItem,
  PriceFilter,
} from "./filter-items";
import { cn } from "~/lib/utils";
import { app } from "~/server/application";
import { cacheTag } from "next/cache";

export async function Filters({ className }: { className?: string }) {
  "use cache";

  cacheTag("categories");

  const categoriesPromise = app.public.categories.queries.findAll({
    filters: { root: true },
  });
  const brandsPromise = app.public.brands.queries.findAll();

  const [categories, brands] = await Promise.all([
    categoriesPromise,
    brandsPromise,
  ]);

  return (
    <aside id="filters" className={cn("hidden lg:block", className)}>
      <Card className="p-4">
        <CardContent className="p-0 pb-4">
          <div className="flex flex-col gap-6 divide-y [&>*:not(:last-child)]:pb-8">
            <div className="flex flex-col gap-4">
              <Heading level={4}>Categories</Heading>

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
            </div>

            <div className="flex flex-col gap-4">
              <Heading level={4}>Brands</Heading>
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <BrandFilterItem key={`brand-${brand.slug}`} brand={brand} />
                ))
              ) : (
                <BrandFilterEmptyState />
              )}
            </div>

            <PriceFilter />
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function CategoryFilterEmptyState() {
  return (
    <Empty className="gap-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderXIcon />
        </EmptyMedia>
        <EmptyTitle>No categories found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any categories to display at the moment. Please
          check back later!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function BrandFilterEmptyState() {
  return (
    <Empty className="gap-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No brands found</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t find any brands to display at the moment. Please
          check back later!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
