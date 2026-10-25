import { ArrowUpRightIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProduct } from "./_components/edit-product";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { requireAdmin } from "~/server/auth";
import { tryCatch } from "~/lib/utils/try-catch";
import { AppError } from "~/lib/errors/app-error";
import { PageLayout } from "../../../_components/page-layout";

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
    <PageLayout
      title={`Edit ${product.title}`}
      titleContent={
        // the saved state, the reference's status pill beside the title
        <span className="bg-secondary inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full px-2 text-xs shadow-(--control-shadow)">
          <span
            aria-hidden
            className={
              product.published
                ? "bg-success size-1.5 rounded-full"
                : "bg-muted-foreground size-1.5 rounded-full"
            }
          />
          {product.published ? "Published" : "Draft"}
        </span>
      }
      description="Let's get this product looking good alright?"
      parent={{ title: "Products", href: "/admin/products" }}
      actions={
        // the last saved state, drafts included
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              href={`/products/${product.slug}/preview`}
              target="_blank"
              rel="noopener"
            />
          }
        >
          Preview in store
          <ArrowUpRightIcon data-icon="inline-end" />
        </Button>
      }
      contentWidth="reading"
    >
      <div className="bg-primary/80 fixed inset-x-0 top-0 z-50 border-b px-2 py-2 sm:hidden">
        <div className="flex items-center justify-center gap-2">
          <TriangleAlertIcon className="text-primary-foreground size-4 shrink-0" />
          <p className="text-primary-foreground text-sm">
            This page works best on a larger screen.
          </p>
        </div>
      </div>

      <EditProduct product={product} />
    </PageLayout>
  );
}
