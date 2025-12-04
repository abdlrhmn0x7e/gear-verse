import { ProductDrawer } from "@admin/_components/drawers/product-drawer";
import { ProductsTableSkeleton } from "@admin/_components/tables/products/skeleton";
import { ProductsTable } from "@admin/_components/tables/products/table";
import { loadProductSearchParams } from "@admin/_hooks/use-product-search-params";

import { ProductDetails } from "~/components/features/products/product-details";
import Header from "~/components/header";
import { Button } from "~/components/ui/button";
import { Package, PackagePlusIcon } from "lucide-react";

import { Suspense } from "react";
import Link from "next/link";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { requireAdmin } from "~/server/auth";
import { Reviews } from "./_component/reviews";
import type { SearchParams } from "nuqs/server";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await loadProductSearchParams(searchParams);
  void prefetch(
    trpc.admin.products.queries.getPage.infiniteQueryOptions({
      pageSize: 15,
      filters: {
        title: params.title ?? undefined,
        brands: params.brands ?? undefined,
        categories: params.categories ?? undefined,
      },
    }),
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Header
          title="Products Overview"
          description="Manage your products and their information"
          Icon={Package}
        />

        <Button size="lg" asChild>
          <Link href="/admin/products/new">
            <PackagePlusIcon />
            Add Product
          </Link>
        </Button>
      </div>

      <HydrateClient>
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable />
        </Suspense>
      </HydrateClient>

      <ProductDrawer>
        {params.slug && (
          <ProductDetails
            className="lg:grid-cols-1 lg:px-4 xl:px-4 [&>div]:first:lg:static"
            slug={params.slug}
            Reviews={(props) => <Reviews {...props} />}
            hideActions
          />
        )}
      </ProductDrawer>
    </section>
  );
}
