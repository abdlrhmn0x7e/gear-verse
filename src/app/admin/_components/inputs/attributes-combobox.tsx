"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxBadgeItem,
  ComboboxBadgeList,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "~/components/combobox";
import { useTRPC } from "~/trpc/client";

export function AttributeCombobox({
  value,
  categoryId,
  onValueChange,
}: {
  value: number[];
  categoryId?: number;
  onValueChange: (value: number[]) => void;
}) {
  const trpc = useTRPC();
  const { data: attributes, isPending: attributesPending } = useQuery(
    trpc.admin.attributes.queries.getCategoryAttributes.queryOptions(
      {
        categoryId: categoryId!,
      },
      {
        enabled: Boolean(categoryId),
      },
    ),
  );

  const comboboxValues = React.useMemo(() => {
    if (!attributes) return [];

    const selectedValues = attributes.filter((att) =>
      value.includes(att.valueId),
    );

    return selectedValues.map(
      (att) => `${att.name}-${att.value}-${att.valueId.toString()}`,
    );
  }, [value, attributes]);

  if (!categoryId) {
    return (
      <Combobox
        value={value.map((value) => value.toString())}
        onValueChange={(value) =>
          onValueChange(value.map((val) => parseInt(val)))
        }
        className="w-full"
        multiple
        autoHighlight
        disabled
      >
        <ComboboxAnchor>
          <ComboboxInput placeholder="Select a category first" disabled />

          <ComboboxTrigger />
        </ComboboxAnchor>
      </Combobox>
    );
  }

  if (!attributes || attributesPending) {
    return (
      <Combobox
        value={value.map((value) => value.toString())}
        onValueChange={(value) =>
          onValueChange(value.map((val) => parseInt(val)))
        }
        className="w-full min-w-0 p-0"
        multiple
        autoHighlight
        disabled
      >
        <ComboboxAnchor>
          <ComboboxInput placeholder="Select a category first" disabled />

          <ComboboxTrigger />
        </ComboboxAnchor>
      </Combobox>
    );
  }

  if (attributes.length === 0) {
    return (
      <Combobox
        value={value.map((value) => value.toString())}
        onValueChange={(value) =>
          onValueChange(value.map((val) => parseInt(val)))
        }
        className="w-full min-w-0 p-0"
        multiple
        autoHighlight
        disabled
      >
        <ComboboxAnchor>
          <ComboboxInput
            placeholder="No attributes found for this category"
            disabled
          />

          <ComboboxTrigger />
        </ComboboxAnchor>
      </Combobox>
    );
  }

  const handleChange = (value: string[]) => {
    const ids = value.map((val) => parseInt(val.split("-").pop()!));
    onValueChange(ids);
  };

  return (
    <Combobox
      value={comboboxValues}
      onValueChange={handleChange}
      className="w-full min-w-0 p-0"
      multiple
      autoHighlight
    >
      <ComboboxAnchor>
        <ComboboxBadgeList className="max-w-full min-w-0">
          {value.map((item) => {
            const att = attributes?.find((att) => att.valueId === item);
            if (!att) return null;

            return (
              <ComboboxBadgeItem
                className="max-w-full"
                key={`${att.value}-${att.name}`}
                value={`${att.name}-${att.value}-${att.valueId.toString()}`}
              >
                {att.name} - {att.value}
              </ComboboxBadgeItem>
            );
          })}
        </ComboboxBadgeList>
        <ComboboxInput placeholder="Select attributes..." />
        <ComboboxTrigger />
      </ComboboxAnchor>
      <ComboboxContent>
        <ComboboxEmpty>No attributes found.</ComboboxEmpty>
        {attributes?.map((att) => (
          <ComboboxItem
            key={`${att.name}-${att.value}`}
            value={`${att.name}-${att.value}-${att.valueId.toString()}`}
          >
            {att.name} - {att.value}
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}
