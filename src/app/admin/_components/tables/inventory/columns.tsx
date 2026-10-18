/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Field } from "~/components/ui/field";
import { NumberInput } from "~/components/ui/input";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { type InventoryItemFormValues } from "../../forms/inventory-item-form";
import type { RouterOutput } from "~/trpc/client";
import type { ListColumn } from "../list-grid";

type TableInventoryItem =
  RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"][number];
// One array for the life of the page, so the grid keeps its columns (and the
// quantity inputs their focus) across renders.
const inventoryColumns: ListColumn<TableInventoryItem>[] = [
  {
    accessorKey: "product",
    header: "Product",
    meta: { headerClassName: "w-full" },
    cell: ({ row }) => {
      return (
        <div className="flex min-h-12 items-center gap-2">
          <ImageWithFallback
            src={row.original.thumbnailUrl}
            alt={row.original.title}
            width={40}
            height={40}
          />
          <div>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link
                href={`/admin/products/${row.original.productId}${row.original.productVariantId ? `/variants/${row.original.productVariantId}` : ""}`}
              >
                {row.original.title}
              </Link>
            </Button>
            <div className="flex items-center gap-1">
              {row.original.values.map((value) => (
                <Badge key={`${row.original.id}-${value}`} variant="outline">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "location",
    header: "Location",
    cell: "Your basement",
    meta: {
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden text-muted-foreground md:table-cell",
    },
  },
  {
    accessorKey: "quantity",
    header: "Available",
    meta: { headerClassName: "min-w-40", cellClassName: "w-[200px]" },
    cell: ({ row }) => {
      const form = useFormContext<InventoryItemFormValues>();

      return (
        <Controller
          control={form.control}
          name={`inventory.${row.index}.quantity`}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <NumberInput
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="How much you got?"
                value={field.value}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
      );
    },
  },
];

export function useInventoryTableColumns() {
  return inventoryColumns;
}
