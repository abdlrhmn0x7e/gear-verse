import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@admin/_components/page-layout";
import { ProductsTableSkeleton } from "@admin/_components/tables/products/skeleton";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

// Row clicks open the drawer through a `shallow: false` param change, which
// keeps the current page up until the new one renders, so this only shows on
// arriving here.
export default function AdminProductsLoading() {
  return (
    <PageLayout
      title="Products Overview"
      description="Manage your products and their information"
      contentWidth="full"
      actions={
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusIcon data-icon="inline-start" />
            Add Product
          </Link>
        </Button>
      }
      toolbar={
        <>
          <Skeleton className="h-9 w-full rounded-full sm:w-72" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </>
      }
    >
      <ProductsTableSkeleton />
    </PageLayout>
  );
}
