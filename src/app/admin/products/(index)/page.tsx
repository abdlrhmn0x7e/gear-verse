import {
  ProductDrawer,
  ProductDrawerSkeleton,
} from "@admin/_components/drawers/product-drawer";
import { ProductsTableSkeleton } from "@admin/_components/tables/products/skeleton";
import { ProductsTable } from "@admin/_components/tables/products/table";
import { ProductsFilters } from "@admin/_components/tables/products/filters";
import { loadProductSearchParams } from "@admin/_hooks/use-product-search-params";

import { PageLayout } from "@admin/_components/page-layout";

import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";

import { Suspense } from "react";
import Link from "next/link";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { requireAdmin } from "~/server/auth";
import { ProductSummary } from "./_component/product-summary";
import type { SearchParams } from "nuqs/server";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await loadProductSearchParams(searchParams);
  const filters = {
    title: params.title ?? undefined,
    brands: params.brands ?? undefined,
    categories: params.categories ?? undefined,
  };
  void prefetch(
    trpc.admin.products.queries.getPinned.queryOptions({ filters }),
  );
  void prefetch(
    trpc.admin.products.queries.getPage.infiniteQueryOptions(
      { pageSize: 15, filters },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <PageLayout
      title="Products Overview"
      description="Manage your products and their information"
      contentWidth="full"
      actions={
        <Button
          nativeButton={false}
          render={<Link href="/admin/products/new" />}
        >
          <PlusIcon data-icon="inline-start" />
          Add Product
        </Button>
      }
      toolbar={<ProductsFilters />}
    >
      <HydrateClient>
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable />
        </Suspense>
      </HydrateClient>

      <ProductDrawer slug={params.slug}>
        {params.slug && (
          <Suspense key={params.slug} fallback={<ProductDrawerSkeleton />}>
            <ProductSummary slug={params.slug} />
          </Suspense>
        )}
      </ProductDrawer>
    </PageLayout>
  );
}
