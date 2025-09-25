"use client";

import { type PropsWithChildren, useMemo, useState } from "react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Badge } from "~/components/ui/badge";
import { VerseCarousel } from "~/components/verse-carousel";
import type { RouterOutputs } from "~/trpc/react";
import { formatCurrency } from "~/lib/utils/format-currency";
import { VariantButton } from "~/components/variant-button";
import { cn } from "~/lib/utils";
import { BuyNowButton } from "./buy-now-button";
import { XIcon, CheckCircleIcon } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { api } from "~/trpc/react";
import { StarRating } from "./star-rating";

export function Product({
  children,
  product,
}: PropsWithChildren<{
  product: RouterOutputs["public"]["products"]["findBySlug"];
}>) {
  const [selectedVariant, setSelectedVariant] = useState<
    RouterOutputs["public"]["products"]["findBySlug"]["variants"][number]
  >(product.variants[0]!);
  const { data: reviews } = api.public.reviews.findAll.useQuery({
    productId: product.id,
  });

  const selectedVariantInStock = useMemo(
    () => selectedVariant.stock > 0,
    [selectedVariant],
  );
  const carouselPhotos = useMemo(() => {
    const basePhotos = [...selectedVariant.images];
    if (selectedVariant.thumbnail) {
      basePhotos.unshift(selectedVariant.thumbnail);
    }

    return basePhotos;
  }, [selectedVariant]);

  return (
    <section className="py-24 lg:py-32">
      <MaxWidthWrapper className="relative space-y-8 lg:grid lg:grid-cols-2 lg:gap-12">
        <div className="h-fit w-full max-w-full lg:sticky lg:top-32">
          <VerseCarousel
            photos={carouselPhotos}
            className="w-full max-w-full"
          />
        </div>

        <div className="space-y-8 divide-y [&>*:not(:last-child)]:pb-8">
          <div className="space-y-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:items-start">
                <Heading level={2}>{product.name}</Heading>
                <Badge variant="outline" className="pr-1">
                  <ImageWithFallback
                    src={product.brand.logo?.url}
                    alt={product.brand.name}
                    className="size-6 rounded-full border-none"
                    width={16}
                    height={16}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-md">{product.brand.name}</span>
                    <Badge
                      variant={selectedVariantInStock ? "success" : "error"}
                    >
                      {selectedVariantInStock ? <CheckCircleIcon /> : <XIcon />}
                      <span>{selectedVariant.stock}</span>
                      {selectedVariantInStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </Badge>
              </div>
              <p className="text-muted-foreground text-pretty lg:text-lg">
                {product.summary}
              </p>
            </div>

            <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
              <p className="text-primary dark:text-primary-foreground text-3xl font-bold lg:text-4xl">
                {formatCurrency(selectedVariant.price)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StarRating
                  rating={
                    (reviews?.reduce((acc, review) => acc + review.rating, 0) ??
                      0) / (reviews?.length ?? 0)
                  }
                />
                ({reviews?.length ?? 0} reviews)
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heading level={2}>Variants</Heading>
                <p className="text-muted-foreground text-left text-sm md:text-base">
                  (Current Variant - {selectedVariant.name})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <VariantButton
                    key={`${variant.name}-${index}`}
                    variant={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      selectedVariant.name === variant.name &&
                        "ring-primary ring-2",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row">
              <AddToCartButton
                className="w-full lg:flex-1"
                size="lg"
                variant="outline"
                disabled={!selectedVariantInStock}
                productVariantId={selectedVariant.id}
                stock={selectedVariant.stock}
              />

              <BuyNowButton
                productVariantId={selectedVariant.id}
                disabled={!selectedVariantInStock}
              />
            </div>
          </div>

          {children}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
