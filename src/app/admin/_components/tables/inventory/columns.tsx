"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleOffIcon,
} from "lucide-react";
import Link from "next/link";
import { Field } from "~/components/ui/field";
import { NumberInput } from "~/components/ui/input";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Badge } from "~/components/ui/badge";
import { type InventoryItemFormValues } from "../../forms/inventory-item-form";
import type { RouterOutput } from "~/trpc/client";
import type { ListColumn } from "../list-grid";
import { cn } from "~/lib/utils";
import { DataGridTableRowExpand } from "~/components/reui/data-grid/data-grid-table";

export type InventoryProductRow =
  RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"][number];
export type InventoryItemRow = InventoryProductRow["items"][number];

/** A stock row: a product without variants, or one variant of a group. */
export type InventoryItemNode = {
  kind: "item";
  key: string;
  productId: number;
  /** `formIndex` is the item's row in the inventory form. */
  item: InventoryItemRow & { formIndex: number };
  title: string;
  thumbnailUrl: string | null;
};
export type InventoryNode =
  | InventoryItemNode
  | {
      kind: "group";
      key: string;
      productId: number;
      title: string;
      thumbnailUrl: string | null;
      variants: InventoryItemNode[];
    };

// The storefront starts saying "only N left" under this many.
const LOW_STOCK_BELOW = 4;

export function stockStatus(quantity: number | undefined) {
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

// Per depth, so a variant's thumbnail lines up under its product's title.
const VARIANT_INDENT = 64;

function quantityName(node: InventoryItemNode) {
  return `inventory.${node.item.formIndex}.quantity` as const;
}

// One array for the life of the page, so the grid keeps its columns (and the
// quantity inputs their focus) across renders. Cells reach the form through
// each item's `formIndex`: a variant's `row.index` counts within its product.
export const inventoryColumns: ListColumn<InventoryNode>[] = [
  {
    id: "itemId",
    header: "Item No.",
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden text-muted-foreground tabular-nums sm:table-cell",
    },
    cell: ({ row }) =>
      row.original.kind === "item" && <span># {row.original.item.id}</span>,
  },
  {
    id: "title",
    header: ({ table }) => {
      const expanded = table.getIsAllRowsExpanded();

      return (
        <div className="flex items-center gap-3">
          {table.getCanSomeRowsExpand() ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse all" : "Expand all"}
              onClick={() => table.toggleAllRowsExpanded()}
              className="hover:text-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <ChevronDownIcon
                aria-hidden
                className="size-4 transition-transform duration-200 in-aria-[expanded=false]:-rotate-90 rtl:in-aria-[expanded=false]:rotate-90"
              />
            </button>
          ) : (
            <span aria-hidden className="size-7 shrink-0" />
          )}
          Product
        </div>
      );
    },
    // max-w-0 lets the title truncate instead of widening the table
    meta: { headerClassName: "w-full", cellClassName: "max-w-0 min-w-64" },
    cell: ({ row }) => {
      const node = row.original;
      const isVariant = row.depth > 0;
      const variantId = node.kind === "item" && node.item.productVariantId;

      return (
        <div className="flex items-center gap-3">
          {node.kind === "group" || isVariant ? (
            <DataGridTableRowExpand row={row} indent={VARIANT_INDENT} />
          ) : (
            // the toggle's width, so every product's thumbnail lines up
            <span aria-hidden className="size-7 shrink-0" />
          )}
          <ImageWithFallback
            src={node.thumbnailUrl}
            alt={node.title}
            className={cn(
              "text-muted-foreground shrink-0 [&>svg]:size-1/2",
              isVariant ? "size-7" : "size-8",
            )}
            width={isVariant ? 28 : 32}
            height={isVariant ? 28 : 32}
          />
          <div className="min-w-0 text-sm">
            <Link
              href={`/admin/products/${node.productId}${variantId ? `/variants/${variantId}` : ""}`}
              // opening the product, not toggling its group
              onClick={(event) => event.stopPropagation()}
              className="block truncate font-medium underline-offset-4 hover:underline"
            >
              {node.title}
            </Link>
            {!isVariant && (
              <p className="text-muted-foreground truncate text-xs">
                {node.kind === "group"
                  ? pluralVariants(
                      node.variants.filter((v) => v.item.productVariantId)
                        .length,
                    )
                  : "No variants"}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "quantity",
    header: "Available",
    meta: { headerClassName: "min-w-32", cellClassName: "w-36" },
    cell: ({ row }) => {
      const node = row.original;
      if (node.kind === "group") {
        return <GroupTotal variants={node.variants} />;
      }

      return (
        <QuantityInput
          node={node}
          label={[row.getParentRow()?.original.title, node.title]
            .filter(Boolean)
            .join(" ")}
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
    cell: ({ row }) =>
      row.original.kind === "group" ? (
        <GroupStatus variants={row.original.variants} />
      ) : (
        <ItemStatus node={row.original} />
      ),
  },
];

function pluralVariants(count: number) {
  return count === 1 ? "1 variant" : `${count} variants`;
}

function QuantityInput({
  node,
  label,
}: {
  node: InventoryItemNode;
  label: string;
}) {
  const form = useFormContext<InventoryItemFormValues>();

  return (
    <Controller
      control={form.control}
      name={quantityName(node)}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <NumberInput
            id={field.name}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            min={0}
            aria-label={`Available stock of ${label}`}
            aria-invalid={fieldState.invalid}
            placeholder="0"
            className="w-32 [&_input]:h-8 [&_input]:tabular-nums"
            value={field.value ?? ""}
            // unlike onChange, this also fires for the stepper arrows
            onValueChange={field.onChange}
          />
        </Field>
      )}
    />
  );
}

/** The variants' quantities as typed, so the group follows its edits. */
function useVariantQuantities(variants: InventoryItemNode[]) {
  const form = useFormContext<InventoryItemFormValues>();
  return useWatch({ control: form.control, name: variants.map(quantityName) });
}

function GroupTotal({ variants }: { variants: InventoryItemNode[] }) {
  const quantities = useVariantQuantities(variants);
  const total = quantities.reduce<number>((sum, q) => sum + (q ?? 0), 0);

  return (
    <span className="text-muted-foreground text-sm tabular-nums">{total}</span>
  );
}

function ItemStatus({ node }: { node: InventoryItemNode }) {
  const form = useFormContext<InventoryItemFormValues>();
  // Follows the quantity being typed, so the badge previews the save.
  const quantity = useWatch({
    control: form.control,
    name: quantityName(node),
  });
  const saved = node.item.quantity;
  const changed = quantity !== undefined && quantity !== saved;

  return (
    <StatusBadge
      status={stockStatus(quantity)}
      note={`was ${saved}`}
      showNote={changed}
    />
  );
}

/** The worst status among the variants, and how many of them it covers. */
function GroupStatus({ variants }: { variants: InventoryItemNode[] }) {
  const quantities = useVariantQuantities(variants);
  const statuses = quantities.map((q) => stockStatus(q).variant);
  const out = statuses.filter((v) => v === "error").length;
  const low = statuses.filter((v) => v === "warning").length;
  // Edits inside a collapsed group still show here.
  const unsaved = quantities.filter(
    (q, i) => q !== undefined && q !== variants[i]?.item.quantity,
  ).length;

  const status = out
    ? {
        ...stockStatus(0),
        label: out === statuses.length ? "Out of stock" : `${out} out of stock`,
      }
    : low
      ? { ...stockStatus(1), label: `${low} low stock` }
      : stockStatus(LOW_STOCK_BELOW);

  return (
    <StatusBadge
      status={status}
      note={`${unsaved} unsaved`}
      showNote={unsaved > 0}
    />
  );
}

function StatusBadge({
  status: { label, variant, icon },
  note,
  showNote,
}: {
  status: ReturnType<typeof stockStatus>;
  note: string;
  showNote: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>
        {icon}
        {label}
      </Badge>
      <span
        aria-hidden={!showNote}
        className={cn(
          "text-muted-foreground text-xs tabular-nums transition-opacity duration-150",
          !showNote && "opacity-0",
        )}
      >
        {note}
      </span>
    </div>
  );
}
