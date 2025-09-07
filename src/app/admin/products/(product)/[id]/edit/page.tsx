import { PackageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "~/app/admin/_components/page-header";
import { EditProduct } from "./_components/edit-product";
import { api } from "~/trpc/server";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (isNaN(parseInt(id))) {
    return notFound();
  }

  const product = await api.products.findById({ id: parseInt(id) });
  if (!product) {
    return notFound();
  }

  return (
    <section className="space-y-6">
      <Header
        title={`Edit ${product.title}`}
        description="Let's get this product looking good alright?"
        Icon={PackageIcon}
      />

      <EditProduct product={product} />
    </section>
  );
}
