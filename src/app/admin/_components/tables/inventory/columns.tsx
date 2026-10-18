/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CircleAlertIcon, CircleCheckIcon, CircleOffIcon } from "lucide-react";
import Link from "next/link";
import { Field } from "~/components/ui/field";
import { NumberInput } from "~/components/ui/input";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Badge } from "~/components/ui/badge";
import { type InventoryItemFormValues } from "../../forms/inventory-item-form";
import type { RouterOutput } from "~/trpc/client";
import type { ListColumn } from "../list-grid";
import { cn } from "~/lib/utils";

export type InventoryRow =
  RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"][number];

// The storefront starts saying "only N left" under this many.
const LOW_STOCK_BELOW = 4;

function stockStatus(quantity: number | undefined) {
  if (!quantity || quantity <= 0) {
    return {
      label: "Out of stock",
      variant: "error" as const,
      icon: <CircleOffIcon />,
    };
  }

  if (quantity < LOW_STOCK_BELOW) {
    return {
      label: "Low stock",
      variant: "warning" as const,
      icon: <CircleAlertIcon />,
    };
  }

  return {
    label: "In stock",
    variant: "success" as const,
    icon: <CircleCheckIcon />,
  };
}

// One array for the life of the page, so the grid keeps its columns (and the
// quantity inputs their focus) across renders. The form's rows line up with the
// grid's, so a row's index is its place in the form.
export const inventoryColumns: ListColumn<InventoryRow>[] = [
  {
    accessorKey: "id",
    header: "Item No.",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden text-muted-foreground tabular-nums sm:table-cell",
    },
    cell: ({ row }) => <span># {row.original.id}</span>,
  },
  {
    accessorKey: "title",
    header: "Product",
    meta: { headerClassName: "w-full" },
    cell: ({ row }) => {
      const { productId, productVariantId, title, thumbnailUrl, values } =
        row.original;

      return (
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src={thumbnailUrl}
            alt={title}
            className="text-muted-foreground size-10 shrink-0 [&>svg]:size-1/2"
            width={40}
            height={40}
          />
          <div className="min-w-0 text-sm">
            <Link
              href={`/admin/products/${productId}${productVariantId ? `/variants/${productVariantId}` : ""}`}
              className="block truncate font-medium underline-offset-4 hover:underline"
            >
              {title}
            </Link>
            <p className="text-muted-foreground truncate">
              {productVariantId
                ? values.filter(Boolean).join(" / ") || "Variant"
                : "No variants"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Available",
    meta: { headerClassName: "min-w-32", cellClassName: "w-36" },
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
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                min={0}
                aria-label={`Available stock of ${row.original.title}`}
                aria-invalid={fieldState.invalid}
                placeholder="0"
                className="w-32"
                value={field.value ?? ""}
                // unlike onChange, this also fires for the stepper arrows
                onValueChange={field.onChange}
              />
            </Field>
          )}
        />
      );
    },
  },
  {
    id: "status",
    header: "Status",
    // Wide enough for the widest badge and its "was" note, so a status that
    // changes while typing never resizes the column.
    meta: { headerClassName: "w-56 min-w-56", cellClassName: "w-56 min-w-56" },
    cell: ({ row }) => {
      const form = useFormContext<InventoryItemFormValues>();
      // Follows the quantity being typed, so the badge previews the save.
      const quantity = useWatch({
        control: form.control,
        name: `inventory.${row.index}.quantity`,
      });
      const { label, variant, icon } = stockStatus(quantity);
      const saved = row.original.quantity;
      const changed = quantity !== undefined && quantity !== saved;

      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant}>
            {icon}
            {label}
          </Badge>
          <span
            aria-hidden={!changed}
            className={cn(
              "text-muted-foreground text-xs tabular-nums transition-opacity duration-150",
              !changed && "opacity-0",
            )}
          >
            was {saved}
          </span>
        </div>
      );
    },
  },
];
