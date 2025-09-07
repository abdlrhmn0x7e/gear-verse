import Link from "next/link";
import { Package, PackagePlusIcon } from "lucide-react";
import type { SearchParams } from "nuqs";

import { Button } from "~/components/ui/button";
import Header from "../../_components/page-header";
import { ProductsTable } from "../../_components/tables/products/table";
import { loadProductSearchParams } from "../../_hooks/use-product-search-params";
import { api, HydrateClient } from "~/trpc/server";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  void loadProductSearchParams(await searchParams);
  void api.products.getPage.prefetchInfinite({
    pageSize: 10,
  });
  void api.brands.getPage.prefetchInfinite({
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Header
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
