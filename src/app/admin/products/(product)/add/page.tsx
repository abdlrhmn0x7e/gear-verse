import { PackageIcon, TriangleAlertIcon } from "lucide-react";
import { AddProduct } from "./_components/add-product";
import Header from "../../../_components/page-header";

export default function AdminProductsAddPage() {
  return (
    <section className="space-y-6">
      <div className="bg-primary/80 fixed inset-x-0 top-0 z-50 border-b px-2 py-2 sm:hidden">
        <div className="flex items-center justify-center gap-2">
          <TriangleAlertIcon className="text-primary-foreground size-4 shrink-0" />
          <p className="text-primary-foreground text-sm">
            this page is not meant to be used on mobile devices.
          </p>
        </div>
      </div>

      <Header
        title="Add Product"
        description="Add a new product to your store"
        Icon={PackageIcon}
      />

      <AddProduct />
    </section>
  );
}
