import Link from "next/link";
import PageHeader from "../../_components/page-header";
import { Package, PackagePlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ProductsTable } from "../../_components/tables/products/table";
import { Suspense } from "react";
import { ProductsTableSkeleton } from "../../_components/tables/products/skeleton";
import { api, HydrateClient } from "~/trpc/server";

export default function AdminProductsPage() {
  void api.products.getPage.prefetchInfinite({
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
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable />
        </Suspense>
      </HydrateClient>
    </section>
  );
}
