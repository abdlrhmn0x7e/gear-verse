"use client";

import { type PropsWithChildren, useMemo } from "react";
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
import { XIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { api } from "~/trpc/react";
import { StarRating } from "./star-rating";
import { Button } from "~/components/ui/button";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";

type Product = RouterOutputs["public"]["products"]["queries"]["findBySlug"];

export function Product({
  children,
  product,
  className,
  hideActions,
}: PropsWithChildren<{
  product: Product;
  className?: string;
  hideActions?: boolean;
}>) {
  const { data: reviews } = api.public.reviews.findAll.useQuery({
    productId: product.id,
  });

  const options = product.options ?? [];
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const hasOptionsAndVariants = options.length > 0 && variants.length > 0;

  // Store hooks
  const selectedOptions = useVariantSelectionStore(
    (state) => state.selectedOptions,
  );
  const variantId = useVariantSelectionStore((state) => state.variantId);
  const updateSelectedOption = useVariantSelectionStore(
    (state) => state.updateSelectedOption,
  );

  // Derive the selected variant from selected options or fallback to variantId
  const selectedVariant = useMemo(() => {
    if (hasOptionsAndVariants) {
      const exact = variants.find((v) =>
        Object.entries(selectedOptions).every(
          ([name, value]) => v.optionValues[name] === value,
        ),
      );
      return exact ?? variants[0];
    }

    // No options, use variantId or first
    if (variants.length > 0) {
      return variants.find((v) => v.id === variantId) ?? variants[0];
    }

    // No variants available, return null
    return null;
  }, [variants, selectedOptions, variantId, hasOptionsAndVariants]);

  const selectedVariantInStock = useMemo(
    () => (selectedVariant ? (selectedVariant.stock ?? 0) > 0 : false),
    [selectedVariant],
  );

  return (
    <MaxWidthWrapper
      className={cn("relative space-y-4 lg:grid lg:grid-cols-2", className)}
    >
      {/* Image Carousel Section */}
      <div className="h-fit lg:sticky lg:top-24">
        <VerseCarousel
          photos={
            selectedVariant
              ? [selectedVariant.thumbnailUrl, ...product.media]
              : product.media
          }
          className="mx-auto lg:max-w-4/5"
        />

        <ProductBrandBadge
          brand={product.brand}
          selectedVariantInStock={selectedVariantInStock}
          stock={selectedVariant?.stock ?? 0}
          className="absolute top-2 right-6 z-10 md:right-14 lg:hidden"
        />
      </div>

      {/* Content Section */}
      <div className="space-y-8 divide-y [&>*:not(:last-child)]:pb-8">
        <div className="space-y-8">
          {/* Product Header */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex flex-col items-center justify-between gap-2 lg:flex-row lg:items-start">
              <Heading level={2}>{product.title}</Heading>

              <ProductBrandBadge
                brand={product.brand}
                selectedVariantInStock={selectedVariantInStock}
                stock={selectedVariant?.stock ?? 0}
                className="hidden lg:flex"
              />
            </div>

            <p className="text-muted-foreground text-pretty lg:text-lg">
              {product.summary}
            </p>
          </div>

          {/* Price and Reviews */}
          <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
            <p className="space-x-2">
              <span className="text-primary dark:text-primary-foreground text-3xl font-bold lg:text-4xl">
                {formatCurrency(
                  selectedVariant?.overridePrice === 0 ||
                    !selectedVariant?.overridePrice
                    ? product.price
                    : selectedVariant.overridePrice,
                )}
              </span>

              {product.strikeThroughPrice && (
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.strikeThroughPrice ?? 0)}
                </span>
              )}
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

          {/* Variant Selector - Only show if options and variants exist */}
          {hasOptionsAndVariants && selectedVariant && (
            <VariantSelector
              product={product}
              onSelectOption={(name, value) =>
                updateSelectedOption(name, value, variants)
              }
              selectedOptions={selectedOptions}
              selectedVariant={selectedVariant}
            />
          )}

          {/* Action Buttons */}
          {!hideActions && selectedVariant && (
            <div className="flex flex-col gap-2 lg:flex-row">
              <AddToCartButton
                className="peer w-full lg:flex-1"
                size="lg"
                variant="outline"
                disabled={!selectedVariantInStock}
                product={product}
              />

              <BuyNowButton
                className="peer-disabled:pointer-events-none peer-disabled:opacity-50"
                disabled={!selectedVariantInStock}
                product={product}
              />
            </div>
          )}
        </div>

        {children}
      </div>
    </MaxWidthWrapper>
  );
}

interface VariantSelectorProps {
  product: Product;
  selectedOptions: Record<string, string>;
  onSelectOption: (name: string, value: string) => void;
  selectedVariant: NonNullable<Product["variants"]>[number];
}

function VariantSelector({
  product,
  selectedOptions,
  onSelectOption,
  selectedVariant,
}: VariantSelectorProps) {
  const options = product.options ?? [];
  const variants = product.variants ?? [];
  const firstOption = options[0];
  const otherOptions = options.slice(1);

  const getVariantMatchingPartial = (partial: Record<string, string>) =>
    variants.find((v) =>
      Object.entries(partial).every(
        ([name, value]) => v.optionValues[name] === value,
      ),
    );

  const getRepresentativeVariantForFirstValue = (value: string) => {
    if (!firstOption) {
      return variants[0]!;
    }

    const partial: Record<string, string> = { [firstOption.name]: value };

    for (const opt of otherOptions) {
      const selected = selectedOptions[opt.name];
      if (selected) {
        partial[opt.name] = selected;
      }
    }

    return (
      getVariantMatchingPartial(partial) ??
      variants.find((v) => v.optionValues[firstOption.name] === value) ??
      variants[0]!
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Heading level={2}>Variants</Heading>
        <p className="text-muted-foreground text-left text-sm capitalize md:text-base">
          (Current: {Object.values(selectedVariant.optionValues).join(", ")})
        </p>
      </div>

      <div className="space-y-4 p-2">
        {/* First Option - with visual variant buttons */}
        {firstOption && (
          <div className="space-y-2">
            <p className="text-lg font-medium capitalize">{firstOption.name}</p>

            <div className="flex flex-wrap gap-2">
              {firstOption.values.map((val, index) => {
                const representative = getRepresentativeVariantForFirstValue(
                  val.value,
                );
                const isSelected =
                  selectedOptions[firstOption.name] === val.value;

                return (
                  <div
                    key={`${firstOption.name}-${val.value}-${index}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <VariantButton
                      variant={representative}
                      onClick={() =>
                        onSelectOption(firstOption.name, val.value)
                      }
                      className={cn(isSelected && "ring-primary ring-2")}
                    />
                    <p className="text-sm font-medium">{val.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Options - with button selectors */}
        {otherOptions.length > 0 && (
          <div className="space-y-3">
            {otherOptions.map((opt) => (
              <div key={opt.id} className="space-y-2">
                <p className="text-lg font-medium capitalize">{opt.name}</p>

                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selectedOptions[opt.name] === val.value;
                    const desired = {
                      ...selectedOptions,
                      [opt.name]: val.value,
                    };
                    const exists = !!getVariantMatchingPartial(desired);

                    return (
                      <Button
                        key={`${opt.name}-${val.id}`}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        disabled={!exists}
                        className="border border-transparent capitalize"
                        onClick={() => onSelectOption(opt.name, val.value)}
                      >
                        {val.value}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductBrandBadge({
  brand,
  selectedVariantInStock,
  stock,
  className,
}: {
  brand: { logoUrl: string | null; name: string | null };
  selectedVariantInStock: boolean;
  stock: number;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("bg-background pr-0.5 pl-px", className)}
    >
      <ImageWithFallback
        src={brand.logoUrl}
        alt={brand.name ?? "unknown brand"}
        className="size-6 rounded-full border-none"
        width={16}
        height={16}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-md">{brand.name}</span>
        <Badge
          variant={
            selectedVariantInStock
              ? stock < 4
                ? "warning"
                : "success"
              : "error"
          }
          className="rounded-full"
        >
          {selectedVariantInStock ? (
            stock < 4 ? (
              <AlertTriangleIcon />
            ) : (
              <CheckCircleIcon />
            )
          ) : (
            <XIcon />
          )}
          <span>{stock}</span>
          {selectedVariantInStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>
    </Badge>
  );
}
