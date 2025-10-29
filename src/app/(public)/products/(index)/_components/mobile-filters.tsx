import { ListFilterIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Separator } from "~/components/ui/separator";
import { app } from "~/server/application";
import type { RouterOutput } from "~/trpc/client";
import {
  BrandFilterItem,
  CategoryFilterItem,
  ClearAllButton,
  PriceFilter,
} from "./mobile-filter-items";

export async function MobileFilters() {
  const categoriesPromise = app.public.categories.queries.findAll({
    filters: { root: true },
  });
  const brandsPromise = app.public.brands.queries.findAll();

  const [categories, brands] = await Promise.all([
    categoriesPromise,
    brandsPromise,
  ]);

  return (
    <Drawer>
      <DrawerTrigger className="lg:hidden" asChild>
        <Button variant="outline">
          <ListFilterIcon />
          <span className="hidden sm:block">Filters</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[calc(100vh-4rem)]">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className="space-y-8 px-4 pb-32 md:px-8">
          <CategoryFilter categories={categories} />
          <Separator />
          <BrandFilter brands={brands} />
          <Separator />
          <PriceFilter />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CategoryFilter({
  categories,
}: {
  categories: RouterOutput["public"]["categories"]["queries"]["findAll"];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading level={2}>Categories</Heading>

        <ClearAllButton filterType="categories" />
      </div>

      {categories && categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <CategoryFilterItem
              key={`category-${category.slug}`}
              category={category}
            />
          ))}
        </div>
      ) : (
        <div>No categories found</div>
      )}
    </div>
  );
}

function BrandFilter({
  brands,
}: {
  brands: RouterOutput["public"]["brands"]["queries"]["findAll"];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading level={2}>Brands</Heading>

        <ClearAllButton filterType="brands" />
      </div>
      <div className="flex flex-wrap gap-2">
        {brands && brands.length > 0 ? (
          brands.map((brand) => (
            <BrandFilterItem key={`brand-${brand.slug}`} brand={brand} />
          ))
        ) : (
          <div>No brands found</div>
        )}
      </div>
    </div>
  );
}
