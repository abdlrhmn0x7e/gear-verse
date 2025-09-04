import Link from "next/link";
import PageHeader from "../../_components/page-header";
import { Package, PackagePlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import SummaryCard from "../../_components/summary-card";

export default function AdminProductsPage() {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Total Products"
          value="100"
          Icon={Package}
          description="Total number of products in your store"
        />
      </div>
    </section>
  );
}
