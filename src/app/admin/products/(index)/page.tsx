import { Package, PackagePlusIcon } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ProductDetails } from "~/components/features/products/product-detailts";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/server/auth";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import Header from "../../../../components/header";
import { ProductDrawer } from "../../_components/drawers/product-drawer";
import { ProductsTableSkeleton } from "../../_components/tables/products/skeleton";
import { ProductsTable } from "../../_components/tables/products/table";
import { loadProductSearchParams } from "../../_hooks/use-product-search-params";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await loadProductSearchParams(searchParams);
  void prefetch(
    trpc.admin.products.queries.getPage.infiniteQueryOptions({
      pageSize: 10,
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
            hideActions
          />
        )}
      </ProductDrawer>
    </section>
  );
}
