"use client";

import { type Control, useFormContext, useWatch } from "react-hook-form";
import type { ProductFormValues } from ".";
import { useEffect, useMemo } from "react";
import { cartesianProduct } from "~/lib/utils/cartesian-product";
import { useDebounce } from "~/hooks/use-debounce";

export function Variants({ control }: { control: Control<ProductFormValues> }) {
  const form = useFormContext<ProductFormValues>();

  const options = useWatch({ control, name: "options" });
  const debouncedOptions = useDebounce(options, 500);

  const variants = useWatch({ control, name: "variants" });

  const valuesMap = useMemo(() => {
    return new Map(
      debouncedOptions.flatMap((option) =>
        option.values.map((value) => [value.id, value]),
      ),
    );
  }, [debouncedOptions]);

  useEffect(() => {
    if (debouncedOptions.length === 0) return;

    const values = debouncedOptions.map((option) =>
      option.values.map((value) => value.id),
    );
    if (values.length === 0) return;

    const combinations = cartesianProduct(values);
    console.log("combinations", combinations);

    const final = combinations.map((combination) => {
      if (!Array.isArray(combination)) {
        return [
          {
            ...valuesMap.get(combination),
            thumbnailMediaId: 0,
            overridePrice: 0,
            stock: 0,
          },
        ];
      }

      return combination.map((value) => ({
        ...valuesMap.get(value),
        thumbnailMediaId: 0,
        overridePrice: 0,
        stock: 0,
      }));
    });

    form.setValue("variants", final);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOptions]);

  console.log("variants", variants);

  return <div>{JSON.stringify(variants)}</div>;
}
