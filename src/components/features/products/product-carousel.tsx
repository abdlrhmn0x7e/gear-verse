"use client";

import { VerseCarousel } from "~/components/verse-carousel";
import { ProductBrandBadge, type BadgeBrand } from "./product-brand-badge";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";

export function ProductCarousel({
  media,
  brand,
}: {
  media: string[];
  brand: BadgeBrand;
}) {
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );

  return (
    <div className="h-fit lg:sticky lg:top-24">
      <VerseCarousel
        photos={
          selectedVariant ? [selectedVariant.thumbnailUrl, ...media] : media
        }
        className="mx-auto lg:max-w-4/5"
      />

      <ProductBrandBadge
        brand={brand}
        className="absolute top-2 right-6 z-10 md:right-14 lg:hidden"
      />
    </div>
  );
}
