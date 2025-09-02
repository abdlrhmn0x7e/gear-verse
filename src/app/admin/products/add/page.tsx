import { PackageIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { AddProduct } from "./_components/add-product";

export default function AdminProductsAddPage() {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <PackageIcon />
          <Heading level={3} font="sans">
            Add Product
          </Heading>
        </div>
        <p className="text-muted-foreground">
          Add a new product to your store. silly you...
        </p>
      </div>

      <AddProduct />
    </section>
  );
}
