"use client";

import {
  Fragment,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
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
          const { options } = variant;
          for (const [key, opt] of Object.entries(options)) {
            if (!key || !opt) return acc;

            acc[key] ??= new Set();
            acc[key].add(opt.value);
          }

          return acc;
        },
        {} as Record<string, Set<string>>,
      ),
    [variants],
  );

  // get the combination values key for a variant
  function getValuesKey(variant: Variant) {
    return Object.values(variant.options)
      .map((opt) => opt.value)
      .join("-");
  }

  // construct the map of variant values key to variant id
  const variantsMap = useMemo(
    () =>
      new Map<string, StoredVariant>(
        variants.map((variant) => [
          getValuesKey(variant),
          {
            id: variant.id,
            thumbnailUrl: variant.thumbnailUrl ?? "",
            stock: variant.stock,
            overridePrice: variant.overridePrice,
          },
        ]),
      ),
    [variants],
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
    setSelectedValues(newValues);

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

  // set the first value of each option as selected by default
  const mountEffect = useEffectEvent(() => {
    const defaultValues = Object.values(options).map((valuesSet) => {
      return Array.from(valuesSet)[0]!;
    });

    setSelectedValues(defaultValues);

    // update the selected variant - access the latest variantsMap from closure
    const variantKey = defaultValues.join("-");
    const selectedVariant = variantsMap.get(variantKey);
    if (selectedVariant) {
      setSelectedVariant(selectedVariant);
    }
  });

  // cleanup effect
  const unMountEffect = useEffectEvent(() => {
    setSelectedValues([]);
    setSelectedVariant(null);
  });

  useLayoutEffect(() => {
    mountEffect();

    return () => unMountEffect();
  }, [variantsMap, options]);

  return Object.entries(options).map(([optionName, values], index) => (
    <div key={optionName} className="mb-4">
      <h4 className="mb-2 font-medium">{optionName}</h4>
      {index === 0 ? (
        <PrimaryOptionValueButton
          values={values}
          variantThumbnails={variants.map((v) => ({
            value: Object.values(v.options)[0]!.value,
            thumbnailUrl: v.thumbnailUrl ?? "",
          }))}
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
  variantThumbnails: { value: string; thumbnailUrl: string }[];
  selectedValues: string[];
  className?: string;
}) {
  const parsedValues = Array.from(values);

  return (
    <div className="flex flex-wrap gap-2">
      {parsedValues.map((value, idx) => (
        <div
          className="flex flex-col items-center gap-1"
          key={`option-value-fragment-${value}`}
        >
          <button
            data-active={selectedValues.includes(value)}
            className={cn(
              "ring-primary size-16 cursor-pointer overflow-hidden rounded-md transition-shadow outline-none hover:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none data-[active=true]:ring-2",
              className,
            )}
            onClick={() => handleOptionValueSelect?.(value)}
          >
            <ImageWithFallback
              src={
                variantThumbnails.find((vt) => vt.value === value)
                  ?.thumbnailUrl || ""
              }
              alt={value}
              className="size-full"
              width={128}
              height={128}
            />
          </button>
          <span className="text-muted-foreground text-sm font-medium">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
