import Link from "next/link";
import PageHeader from "../../_components/page-header";
import { Package, PackagePlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ProductsTable } from "../../_components/tables/products/table";
import { api, HydrateClient } from "~/trpc/server";
import { loadProductFiltersSearchParams } from "../../_components/tables/products/hooks";
import type { SearchParams } from "nuqs";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  void loadProductFiltersSearchParams(await searchParams);
  void api.products.getPage.prefetchInfinite({
    pageSize: 10,
  });
  void api.brands.getPage.prefetchInfinite({
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Products Overview"
          description="Manage your products and their information"
          Icon={Package}
        />

        <Button size="lg" asChild>
          <Link href="/admin/products/add">
            <PackagePlusIcon />
            Add Product
          </Link>
        </Button>
      </div>

      <HydrateClient>
        <ProductsTable />
      </HydrateClient>
    </section>
  );
}
