"use client";

import { useEffectEvent, useLayoutEffect, useMemo, useState } from "react";
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
}

/*
  A component to select product variants based on their options.
  It displays buttons for each option value and allows users to select them.
  each value is unique
*/
export function ProductVariantSelector({
  variants,
}: ProductVariantSelectorProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const setSelectedVariant = useVariantSelectionStore(
    (store) => store.setSelectedVariant,
  );

  // build the options
  const options = useMemo(
    () =>
      variants.reduce(
        (acc, variant) => {
          for (const option of variant.options) {
            const [key, opt] = Object.entries(option)[0]!;
            acc[key] ??= new Set();

            acc[key].add(opt.value);
          }
          return acc;
        },
        {} as Record<string, Set<string>>,
      ),
    [],
  );

  // get the combination values key for a variant
  function getValuesKey(variant: Variant) {
    return variant.options
      .flatMap((option) => Object.values(option).map((val) => val.value))
      .join("-");
  }

  // construct the map of variant values key to variant id
  const variantsMap = new Map<string, StoredVariant>(
    variants.map((variant) => [
      getValuesKey(variant),
      {
        id: variant.id,
        thumbnailUrl: variant.thumbnailUrl ?? "",
        stock: variant.stock,
        overridePrice: variant.overridePrice,
      },
    ]),
  );

  function handleOptionValueSelect(
    optionName: keyof typeof options,
    value: string,
  ) {
    const optionValues = Array.from(options[optionName]!);
    const siblingOptionValues = optionValues.filter((v) => v !== value);

    // it has to be in the same order, so we just switch out the value
    setSelectedValues((prevSelectedValues) => {
      // if the dims arent equal, we need to fill in the missing values
      if (prevSelectedValues.length !== optionValues.length) {
        return [...prevSelectedValues, value];
      }

      const newValues = prevSelectedValues.map((prev) =>
        siblingOptionValues.includes(prev) ? value : prev,
      );

      // update the selected variant
      updateSelectedVariant(newValues);

      return newValues;
    });
  }

  function updateSelectedVariant(newValues: string[]) {
    const variantKey = newValues.join("-");
    const selectedVariant = variantsMap.get(variantKey);
    if (selectedVariant) {
      setSelectedVariant(selectedVariant);
    }
  }

  // set the first value of each option as selected by default
  const mountEffect = useEffectEvent(() => {
    const defaultValues = Object.values(options).map((valuesSet) => {
      return Array.from(valuesSet)[0]!;
    });

    setSelectedValues(defaultValues);

    // update the selected variant
    updateSelectedVariant(defaultValues);
  });

  useLayoutEffect(() => {
    mountEffect();
  }, []);

  return Object.entries(options).map(([optionName, values], index) => (
    <div key={optionName} className="mb-4">
      <h4 className="mb-2 font-medium">{optionName}</h4>
      {index === 0 ? (
        <PrimaryOptionValueButton
          values={values}
          variantThumbnails={variants.map((v) => v.thumbnailUrl!)}
          selectedValues={selectedValues}
          handleOptionValueSelect={(value) =>
            handleOptionValueSelect(optionName, value)
          }
        />
      ) : (
        <div className="flex flex-wrap gap-1">
          {Array.from(values).map((value) => (
            <Button
              variant={selectedValues.includes(value) ? "default" : "outline"}
              onClick={() => handleOptionValueSelect(optionName, value)}
              key={`value-button-${value}`}
            >
              {value}
            </Button>
          ))}
        </div>
      )}
    </div>
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
  variantThumbnails: string[];
  selectedValues: string[];
  className?: string;
}) {
  const parsedValues = Array.from(values);

  if (parsedValues.length !== Math.floor(variantThumbnails.length / 2)) {
    return null;
  }

  return parsedValues.map((value, idx) => (
    <button
      key={`value-${value}-${idx}`}
      data-active={selectedValues.includes(value)}
      className={cn(
        "ring-primary size-16 cursor-pointer overflow-hidden rounded-md transition-shadow outline-none hover:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2 data-[active=true]:ring-2",
        className,
      )}
      onClick={() => handleOptionValueSelect?.(value)}
    >
      <ImageWithFallback
        src={variantThumbnails[idx]}
        alt={value}
        className="size-full"
        width={128}
        height={128}
      />
      <span>{value}</span>
    </button>
  ));
}
