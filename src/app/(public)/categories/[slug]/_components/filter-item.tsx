"use client";

import { useQueryState } from "nuqs";
import { parseAsArrayOf, parseAsBoolean, parseAsString } from "nuqs/server";
import { useEffectEvent, useLayoutEffect } from "react";
import { CustomCheckbox } from "~/components/custom-checkbox";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import type { AttributeType } from "~/lib/schemas/entities/attribute";

interface ItemProps {
  label: string;
  keyName: string;
  value?: string;
  type: AttributeType;
  isMobile?: boolean;
}

export function FilterItem(props: ItemProps) {
  switch (props.type) {
    case "MULTISELECT": {
      return <MultiSelectItem {...props} />;
    }

    case "SELECT": {
      return <SelectItem {...props} />;
    }

    case "BOOLEAN": {
      return <BoolItem {...props} />;
    }
  }
}

function MultiSelectItem({ label, keyName, value, isMobile }: ItemProps) {
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
    void setFilter((prev) => {
      if (!value) return prev;

      if (!checked && prev) {
        const newValues = prev.filter((val) => val !== value);
        return newValues.length > 0 ? newValues : null;
      }

      return [...(prev ?? []), value];
    });
  };

  return isMobile ? (
    <CustomCheckbox
      id={`attribute-${keyName}-${value}-item`}
      checked={checked}
      onCheckedChange={handleChecked}
    >
      {label}
    </CustomCheckbox>
  ) : (
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

function SelectItem({ label, keyName, value }: ItemProps) {
  const [, setFilter] = useQueryState(
    `select.${keyName}`,
    parseAsString.withOptions({ shallow: true }),
  );

  const unmount = useEffectEvent(() => {
    void setFilter(null);
  });
  useLayoutEffect(() => unmount(), []);

  const handleSelect = () => {
    if (!value) return;
    void setFilter(value);
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

function BoolItem({ label, keyName }: ItemProps) {
  const [filter, setFilter] = useQueryState(
    `bool.${keyName}`,
    parseAsBoolean.withOptions({ shallow: true }),
  );

  const unmount = useEffectEvent(() => {
    void setFilter(null);
  });
  useLayoutEffect(() => unmount(), []);

  const handleChecked = (checked: boolean) => {
    void setFilter(checked);
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
