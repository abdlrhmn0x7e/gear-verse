import { IconTag } from "@tabler/icons-react";
import { TriangleAlertIcon } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "~/components/header";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { api } from "~/trpc/server";
import { EditVariant } from "./_components/edit-variant";
import { Heading } from "~/components/heading";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function AdminVariantPage({
  params,
}: PageProps<"/admin/products/[productId]/variants/[variantId]">) {
  const { productId, variantId } = await params;

  const parsedProductId = parseInt(productId);
  const parsedVariantId = parseInt(variantId);

  if (isNaN(parsedProductId) || isNaN(parsedVariantId)) {
    return notFound();
  }

  const variantPromise = api.admin.productVariants.queries.findById({
    id: parsedVariantId,
  });
  const productPromise = api.admin.productVariants.queries.findProductById({
    productId: parsedProductId,
  });

  const [product, variant] = await Promise.all([
    productPromise,
    variantPromise,
  ]);

  if (!variant || !product) {
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

      <div className="mx-auto max-w-screen-xl space-y-6">
        <Header
          title="Variant Details"
          description="View and edit the details of this product variant"
          headingLevel={5}
          Icon={IconTag}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex gap-4">
                <ImageWithFallback
                  src={product.thumbnailUrl}
                  alt="Product Thumbnail"
                  width={256}
                  height={256}
                  className="size-24"
                />

                <div className="flex flex-1 flex-col">
                  <Heading level={4}>{product.title}</Heading>
                  <p className="text-muted-foreground">
                    {product.variants.length} variants
                  </p>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="space-y-2">
              {/*Maybe Later*/}
              {/*<SearchInput />*/}
              <Heading level={4}>Related Variants</Heading>
              {product.variants.map((variant, index) => {
                const optionValues = Object.values(variant.options)
                  .map((val) => val.value)
                  .join(" / ");

                return (
                  <Button
                    key={`variant-${index}`}
                    variant="link"
                    className="w-full justify-start"
                    disabled={variant.id === parsedVariantId}
                    asChild
                  >
                    <Link
                      href={`/admin/products/${parsedProductId}/variants/${variant.id}`}
                    >
                      <ImageWithFallback
                        src={variant.thumbnailUrl ?? ""}
                        alt={"Variant Thumbnail"}
                        width={64}
                        height={64}
                        className="size-8"
                      />
                      <p className="text-sm">{optionValues}</p>
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <EditVariant variant={variant} />
        </div>
      </div>
    </section>
  );
}
