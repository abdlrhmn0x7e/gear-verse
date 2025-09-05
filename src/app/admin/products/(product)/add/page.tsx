import { PackageIcon } from "lucide-react";
import { AddProduct } from "./_components/add-product";
import PageHeader from "../../../_components/page-header";

export default function AdminProductsAddPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Add a new product to your store"
        Icon={PackageIcon}
      />

      <AddProduct />
    </section>
  );
}
