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
import { XIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { api } from "~/trpc/react";
import { StarRating } from "./star-rating";
import { Button } from "~/components/ui/button";

export function Product({
  children,
  product,
  className,
  hideActions,
}: PropsWithChildren<{
  product: RouterOutputs["public"]["products"]["queries"]["findBySlug"];
  className?: string;
  hideActions?: boolean;
}>) {
  const { data: reviews } = api.public.reviews.findAll.useQuery({
    productId: product.id,
  });

  // Options are ordered grouping is based on the first option
  const { firstOption, otherOptions } = useMemo(() => {
    const options = product.options ?? [];
    const firstOption = options[0];
    const otherOptions = options.slice(1);

    return { firstOption, otherOptions };
  }, [product.options]);

  // Track the currently selected option values; derive the variant from them
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => ({ ...(product.variants[0]?.optionValues ?? {}) }));

  const selectedVariant = useMemo(() => {
    const exact = product.variants.find((variant) =>
      Object.entries(selectedOptions).every(
        ([name, value]) => variant.optionValues[name] === value,
      ),
    );
    return exact ?? product.variants[0]!;
  }, [product.variants, selectedOptions]);

  const selectedVariantInStock = useMemo(
    () => selectedVariant.stock > 0,
    [selectedVariant],
  );

  function getVariantMatchingPartial(partial: Record<string, string>) {
    return product.variants.find((variant) =>
      Object.entries(partial).every(
        ([name, value]) => variant.optionValues[name] === value,
      ),
    );
  }

  function handleSelectOption(optionName: string, value: string) {
    const desired = { ...selectedOptions, [optionName]: value };

    // Prefer an exact match; otherwise fall back to any variant matching the changed option
    const exact = getVariantMatchingPartial(desired);
    if (exact) {
      setSelectedOptions({ ...exact.optionValues });
      return;
    }

    const fallback = product.variants.find(
      (v) => v.optionValues[optionName] === value,
    );
    setSelectedOptions({ ...(fallback ?? product.variants[0]!).optionValues });
  }

  function getRepresentativeVariantForFirstValue(value: string) {
    if (!firstOption) {
      return product.variants[0]!;
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
      product.variants.find(
        (v) => v.optionValues[firstOption.name] === value,
      ) ??
      product.variants[0]!
    );
  }

  return (
    <MaxWidthWrapper
      className={cn("relative space-y-4 lg:grid lg:grid-cols-2", className)}
    >
      <div className="h-full lg:sticky lg:top-32">
        <VerseCarousel
          photos={[selectedVariant.thumbnailUrl, ...product.media]}
          className="mx-auto lg:max-w-4/5"
        />

        <ProductBrandBadge
          brand={product.brand}
          selectedVariantInStock={selectedVariantInStock}
          stock={selectedVariant.stock}
          className="absolute top-2 right-6 z-10 md:right-14 lg:hidden"
        />
      </div>

      <div className="space-y-8 divide-y [&>*:not(:last-child)]:pb-8">
        <div className="space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex flex-col items-center justify-between gap-2 lg:flex-row lg:items-start">
              <Heading level={2}>{product.title}</Heading>

              <ProductBrandBadge
                brand={product.brand}
                selectedVariantInStock={selectedVariantInStock}
                stock={selectedVariant.stock}
                className="hidden lg:flex"
              />
            </div>

            <p className="text-muted-foreground text-pretty lg:text-lg">
              {product.summary}
            </p>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
            <p className="space-x-2">
              <span className="text-primary dark:text-primary-foreground text-3xl font-bold lg:text-4xl">
                {formatCurrency(
                  selectedVariant.overridePrice === 0 ||
                    !selectedVariant.overridePrice
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

          <div>
            <div className="flex items-center gap-2">
              <Heading level={2}>Variants</Heading>

              <p className="text-muted-foreground text-left text-sm capitalize md:text-base">
                (Current Variant -{" "}
                {Object.values(selectedVariant.optionValues).join(", ")})
              </p>
            </div>

            <div className="space-y-4 p-2">
              {firstOption && (
                <div className="space-y-2">
                  <p className="text-lg font-medium capitalize">
                    {firstOption.name}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {firstOption.values.map((val, index) => {
                      const representative =
                        getRepresentativeVariantForFirstValue(val.value);
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
                              handleSelectOption(firstOption.name, val.value)
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

              {otherOptions.length > 0 && (
                <div className="space-y-3">
                  {otherOptions.map((opt) => (
                    <div key={opt.id} className="space-y-2">
                      <p className="text-lg font-medium capitalize">
                        {opt.name}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val) => {
                          const isSelected =
                            selectedOptions[opt.name] === val.value;
                          // Enable/disable based on existence of any variant matching this value with the rest of selections
                          const desired: Record<string, string> = {
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
                              onClick={() =>
                                handleSelectOption(opt.name, val.value)
                              }
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

          {!hideActions && (
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
          )}
        </div>

        {children}
      </div>
    </MaxWidthWrapper>
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
