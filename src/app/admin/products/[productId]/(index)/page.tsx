import { PackageIcon, TriangleAlertIcon } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "~/components/header";
import { EditProduct } from "./_components/edit-product";
import { api } from "~/trpc/server";
import { requireAdmin } from "~/server/auth";
import { tryCatch } from "~/lib/utils/try-catch";
import { AppError } from "~/lib/errors/app-error";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireAdmin();
  const { productId } = await params;
  const parsedId = Number(productId);

  if (isNaN(parsedId)) {
    return notFound();
  }

  const { data: product, error } = await tryCatch(
    api.admin.products.queries.findById({
      id: parsedId,
    }),
  );
  if (error instanceof AppError && error.kind === "NOT_FOUND") {
    return notFound();
  }

  if (error) {
    throw new Error("Failed to load product data.");
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="bg-primary/80 fixed inset-x-0 top-0 z-50 border-b px-2 py-2 sm:hidden">
        <div className="flex items-center justify-center gap-2">
          <TriangleAlertIcon className="text-primary-foreground size-4 shrink-0" />
          <p className="text-primary-foreground text-sm">
            this page is not meant to be used on mobile devices.
          </p>
        </div>
      </div>

      <Header
        title={`Edit ${product.title}`}
        description="Let's get this product looking good alright?"
        Icon={PackageIcon}
      />

      <EditProduct product={product} />
    </section>
  );
}
