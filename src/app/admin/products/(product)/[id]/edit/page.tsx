import { PackageIcon, TriangleAlertIcon } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "~/components/header";
import { EditProduct } from "./_components/edit-product";
import { api, HydrateClient } from "~/trpc/server";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (isNaN(parseInt(id))) {
    return notFound();
  }

  void api.categories.findAll.prefetch();
  void api.brands.getPage.prefetchInfinite({
    pageSize: 10,
  });
  const product = await api.products.findById({ id: parseInt(id) });
  if (!product) {
    return notFound();
  }

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
        title={`Edit ${product.name}`}
        description="Let's get this product looking good alright?"
        Icon={PackageIcon}
      />

      <HydrateClient>
        <EditProduct product={product} />
      </HydrateClient>
    </section>
  );
}
