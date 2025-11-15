"use client";

import { useQueryState } from "nuqs";
import { parseAsArrayOf, parseAsBoolean, parseAsString } from "nuqs/server";
import { useEffectEvent, useLayoutEffect, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import type { AttributeType } from "~/lib/schemas/entities/attribute";

export function FilterItem({
  label,
  type,
  keyName,
  value,
}: {
  label: string;
  keyName: string;
  value?: string;
  type: AttributeType;
}) {
  switch (type) {
    case "MULTISELECT": {
      const [filter, setFilter] = useQueryState(
        `multi.${keyName}`,
        parseAsArrayOf(parseAsString).withOptions({ shallow: true }),
      );
      const checked = filter?.includes(value ?? "unknown") ?? false;

      // const unmount = useEffectEvent(() => {
      //   setFilter(null);
      // });
      // useLayoutEffect(() => unmount(), []);

      const handleChecked = (checked: boolean) => {
        setFilter((prev) => {
          if (!value) return prev;

          if (!checked && prev) {
            const newValues = prev.filter((val) => val !== value);
            return newValues.length > 0 ? newValues : null;
          }

          return [...(prev ?? []), value];
        });
      };

      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`attribute-${keyName}-${value}-item`}
            checked={checked}
            onCheckedChange={handleChecked}
          />
          <Label htmlFor={`attribute-${keyName}-${value}-item`}>{label}</Label>
        </div>
      );
    }

    case "SELECT": {
      const [, setFilter] = useQueryState(
        `select.${keyName}`,
        parseAsString.withOptions({ shallow: true }),
      );
      const unmount = useEffectEvent(() => {
        setFilter(null);
      });
      useLayoutEffect(() => unmount(), []);

      const handleSelect = () => {
        if (!value) return;
        setFilter(value);
      };

      return (
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value={value ?? "Unknown Value"}
            onClick={handleSelect}
            id={`attribute-${keyName}-${value}-item`}
          />
          <Label htmlFor={`attribute-${keyName}-${value}-item`}>{label}</Label>
        </div>
      );
    }

    case "BOOLEAN": {
      const [filter, setFilter] = useQueryState(
        `bool.${keyName}`,
        parseAsBoolean.withOptions({ shallow: true }),
      );

      const unmount = useEffectEvent(() => {
        setFilter(null);
      });
      useLayoutEffect(() => unmount(), []);

      const handleChecked = (checked: boolean) => {
        setFilter(checked);
      };

      return (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`attribute-${keyName}-item`}>{label}</Label>
          <Switch
            id={`attribute-${keyName}-item`}
            checked={filter ?? false}
            onCheckedChange={handleChecked}
          />
        </div>
      );
    }
  }
}
