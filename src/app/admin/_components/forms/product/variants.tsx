"use client";

import { type Control, useFormContext, useWatch } from "react-hook-form";
import type { ProductFormValues } from ".";
import { useEffect, useMemo, useState } from "react";
import { cartesianProduct } from "~/lib/utils/cartesian-product";
import { useDebounce } from "~/hooks/use-debounce";
import { VariantsTable } from "./variants-table";
import type { VariantsTableData } from "./variants-table";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function Variants({ control }: { control: Control<ProductFormValues> }) {
  const form = useFormContext<ProductFormValues>();
  const options = useWatch({ control, name: "options" });
  const variants = useWatch({ control, name: "variants" }) as
    | VariantsTableData[]
    | undefined;
  const debouncedOptions = useDebounce(options, 500);
  const [groupByOption, setGroupByOption] = useState<string>(
    debouncedOptions?.[0]?.name ?? "",
  );
  const [mounted, setMounted] = useState(false);

  const valuesMap = useMemo(() => {
    if (
      debouncedOptions.length === 0 ||
      debouncedOptions[0]?.values[0]?.value === ""
    )
      return new Map<
        number,
        { id: number; value: string; optionName: string }
      >();

    return new Map(
      debouncedOptions.flatMap((option) =>
        option.values.map((value) => [
          value.id,
          { ...value, optionName: option.name },
        ]),
      ),
    );
  }, [debouncedOptions]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const firstName = debouncedOptions?.[0]?.name ?? "";
    if (firstName && firstName !== groupByOption) {
      setGroupByOption(firstName);
    }
  }, [debouncedOptions, groupByOption, mounted]);

  const combinations = useMemo(() => {
    if (debouncedOptions.length === 0) return [];

    const values = debouncedOptions.map((option) =>
      option.values.map((value) => value.id),
    );
    if (values.length === 0) return [];

    return cartesianProduct(values);
  }, [debouncedOptions]);

  const computedVariants = useMemo(() => {
    if (valuesMap.size === 0) return [];

    const computed = combinations.map((combination: number[] | number) => {
      const ids = Array.isArray(combination) ? combination : [combination];
      const optionValues = Object.fromEntries(
        ids.map((id) => {
          const value = valuesMap.get(id)!;

          return [value.optionName, { id, value: value.value }];
        }),
      );

      return {
        optionValues,
        thumbnail: { id: 0, url: "" },
        stock: 0,
      };
    });

    const oldVariants = form.getValues("variants") ?? [];

    const oldByKey = new Map(
      oldVariants.map((variant) => {
        const key = Object.values(variant.optionValues)
          .map((v) => v.id)
          .sort()
          .join("::");
        return [key, variant] as const;
      }),
    );

    const merged = computed.map((variant) => {
      const key = Object.values(variant.optionValues)
        .map((v) => v.id)
        .sort()
        .join("::");
      const existing = oldByKey.get(key);

      return {
        id: existing?.id,
        optionValues: variant.optionValues,
        thumbnail: existing?.thumbnail ?? { id: 0, url: "" },
        stock: existing?.stock ?? 0,
        overridePrice: existing?.overridePrice,
      };
    });

    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinations, valuesMap]);

  useEffect(() => {
    if (!mounted) return;
    form.setValue("variants", computedVariants, { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedVariants, mounted]);

  if (!mounted || !variants || variants.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2">
        <Label className="text-muted-foreground font-medium">Group by</Label>
        <Select value={groupByOption} onValueChange={setGroupByOption}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {debouncedOptions.map(
              (option) =>
                option.name && (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name}
                  </SelectItem>
                ),
            )}
          </SelectContent>
        </Select>
      </div>

      <VariantsTable data={variants} groupByOption={groupByOption} />
    </div>
  );
}
