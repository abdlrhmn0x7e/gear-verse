"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import type { StoredVariant } from "~/stores/variant-selection/store";
import type { RouterOutput } from "~/trpc/client";

type Variant =
  RouterOutput["public"]["products"]["queries"]["findBySlug"]["variants"][number];

interface ProductVariantSelectorProps {
  variants: Variant[];
  /** The product's options and their values, in the admin's order. */
  options: { name: string; values: string[] }[];
}

/*
  A component to select product variants based on their options.
  It displays buttons for each option value and allows users to select them.
  each value is unique
*/
export function ProductVariantSelector({
  variants,
  options: productOptions,
}: ProductVariantSelectorProps) {
  const setSelectedVariant = useVariantSelectionStore(
    (store) => store.setSelectedVariant,
  );

  // the options in the admin's order, keeping only the values a live variant has
  const options = useMemo(() => {
    const acc: Record<string, Set<string>> = {};
    for (const { name, values } of productOptions) {
      const live = values.filter((value) =>
        variants.some((v) => v.options[name]?.value === value),
      );
      if (live.length) acc[name] = new Set(live);
    }
    return acc;
  }, [productOptions, variants]);

  // open on the first variant in stock, else the first variant
  const defaultValues = useMemo(() => {
    const variant = variants.find((v) => v.stock > 0) ?? variants[0];
    return Object.entries(options).map(
      ([key, values]) => variant?.options[key]?.value ?? Array.from(values)[0]!,
    );
  }, [options, variants]);

  // the selection is tied to the options it was made for, so it resets to the defaults when they change
  const [selection, setSelection] = useState<{
    options: typeof options;
    values: string[];
  } | null>(null);
  const selectedValues =
    selection?.options === options ? selection.values : defaultValues;

  // construct the map of variant values key (in option order, like selectedValues) to variant id
  const variantsMap = useMemo(
    () =>
      new Map<string, StoredVariant>(
        variants.map((variant) => [
          Object.keys(options)
            .map((name) => variant.options[name]?.value)
            .join("-"),
          {
            id: variant.id,
            thumbnailUrl: variant.thumbnailUrl ?? "",
            stock: variant.stock,
            overridePrice: variant.overridePrice,
          },
        ]),
      ),
    [options, variants],
  );

  function handleOptionValueSelect(
    optionName: keyof typeof options,
    value: string,
  ) {
    const optionValues = Array.from(options[optionName]!);
    const siblingOptionValues = optionValues.filter((v) => v !== value);

    const newValues = selectedValues.map((prev) =>
      siblingOptionValues.includes(prev) ? value : prev,
    );

    // it has to be in the same order, so we just switch out the value
    setSelection({ options, values: newValues });

    // update the selected variant
    updateSelectedVariant(newValues);
  }

  function updateSelectedVariant(newValues: string[]) {
    const variantKey = newValues.join("-");
    const selectedVariant = variantsMap.get(variantKey);
    if (selectedVariant) {
      setSelectedVariant(selectedVariant);
    }
  }

  // sync the default variant to the store, and clear it on unmount
  useLayoutEffect(() => {
    const selectedVariant = variantsMap.get(defaultValues.join("-"));
    if (selectedVariant) {
      setSelectedVariant(selectedVariant);
    }

    return () => setSelectedVariant(null);
  }, [variantsMap, defaultValues, setSelectedVariant]);

  return Object.entries(options).map(([optionName, values], index) => (
    <fieldset key={optionName} className="flex flex-col gap-3">
      <legend className="mb-3 text-sm">
        <span className="font-medium">{optionName}</span>
        <span className="text-muted-foreground">
          {" "}
          · <span dir="auto">{selectedValues[index]}</span>
        </span>
      </legend>
      {index === 0 ? (
        <PrimaryOptionValueButton
          values={values}
          variantThumbnails={variants.map((v) => ({
            value: v.options[optionName]?.value ?? "",
            thumbnailUrl: v.thumbnailUrl ?? "",
          }))}
          selectedValues={selectedValues}
          handleOptionValueSelect={(value) =>
            handleOptionValueSelect(optionName, value)
          }
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {Array.from(values).map((value) => (
            <Button
              variant={selectedValues.includes(value) ? "selected" : "outline"}
              aria-pressed={selectedValues.includes(value)}
              onClick={() => handleOptionValueSelect(optionName, value)}
              key={`value-button-${value}`}
            >
              <span dir="auto">{value}</span>
            </Button>
          ))}
        </div>
      )}
    </fieldset>
  ));
}

function PrimaryOptionValueButton({
  values,
  variantThumbnails,
  handleOptionValueSelect,
  selectedValues,
  className,
}: {
  values: Set<string>;
  handleOptionValueSelect?: (value: string) => void;
  variantThumbnails: { value: string; thumbnailUrl: string }[];
  selectedValues: string[];
  className?: string;
}) {
  const parsedValues = Array.from(values);

  return (
    <div className="flex flex-wrap gap-3">
      {parsedValues.map((value) => (
        // a fixed width, so a long value wraps under its own tile instead of widening it
        <div
          className="flex w-20 flex-col items-center gap-1.5"
          key={`option-value-fragment-${value}`}
        >
          <button
            type="button"
            aria-pressed={selectedValues.includes(value)}
            aria-label={value}
            className={cn(
              "image-well hover:outline-border focus-visible:outline-focus aria-pressed:outline-foreground size-16 cursor-pointer overflow-hidden rounded-2xl outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-150",
              className,
            )}
            onClick={() => handleOptionValueSelect?.(value)}
          >
            <ImageWithFallback
              src={
                variantThumbnails.find((vt) => vt.value === value)
                  ?.thumbnailUrl ?? ""
              }
              alt=""
              className="size-full rounded-none border-none bg-transparent"
              width={128}
              height={128}
            />
          </button>
          {/* dir="auto" keeps a Latin value like "4 Pairs SS" in its own order on the Arabic page */}
          <span
            aria-hidden
            dir="auto"
            className="text-muted-foreground line-clamp-2 w-full text-center text-xs"
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
