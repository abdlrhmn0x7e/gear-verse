import { notFound } from "next/navigation";
import { ProductCarousel } from "~/components/product-carousel";
import { api } from "~/trpc/server";
import PageHeader from "../../../../_components/page-header";
import {
  CalendarIcon,
  ContainerIcon,
  FileTextIcon,
  ImageIcon,
  Package2Icon,
  PencilIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { ProductDescription } from "./_components/product-description";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { JSONContent } from "@tiptap/react";
import { Button } from "~/components/ui/button";
import { DeleteProductDialog } from "./_components/delete-product-dialog";
import Link from "next/link";
import { format } from "date-fns";

export default async function ProductPage({
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
      <div className="flex items-center justify-between">
        <PageHeader
          title={product.title}
          description="Silly ahh product"
          Icon={Package2Icon}
        />

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            <p className="text-muted-foreground text-sm">
              Created at {format(product.createdAt, "MMM d, yyyy")}
            </p>
          </div>{" "}
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <PencilIcon className="size-4" />
                Edit Product
              </Link>
            </Button>
            <DeleteProductDialog id={product.id} />
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-7 gap-6">
        <div className="sticky top-3 col-span-3 h-fit space-y-6">
          <Card className="h-fit gap-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="size-6" />
                <CardTitle className="text-xl">Product Photos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ProductCarousel
                photos={[
                  { id: 0, url: product.thumbnail!.url },
                  ...product.media,
                ]}
              />
            </CardContent>
          </Card>

          <Card className="h-fit gap-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="size-6" />
                  <CardTitle className="text-xl">Related Listing</CardTitle>
                </div>

                <Button>
                  <PlusIcon className="size-4" />
                  Create Listing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <ContainerIcon size={48} />
                <p className="text-muted-foreground text-lg font-medium">
                  No listings found
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-6" />
              <CardTitle className="text-xl">Product Description</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <ProductDescription
              description={product.description as JSONContent}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
