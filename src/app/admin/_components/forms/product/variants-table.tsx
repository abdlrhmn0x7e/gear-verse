"use client";

import {
  type AggregationFn,
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { MediaDialog } from "../../dialogs/media";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ProductFormValues } from ".";
import type { SelectedMedia } from "~/app/admin/_stores/media/store";
import { ChevronDownIcon, ChevronUpIcon, ImagePlusIcon } from "lucide-react";
import { MediaStoreProvider } from "~/app/admin/_stores/media/provider";
import Image from "next/image";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { NumberInput } from "~/components/ui/input";
import { PriceInput } from "../../inputs/price-input";
import { cn } from "~/lib/utils";

export type VariantsTableData = {
  optionValues: Record<string, { id: number; value: string }>;
  thumbnail: { id: number; url: string };
  overridePrice?: number;
  stock: number;
};

export function VariantsTable({
  data,
  groupByOption,
}: {
  data: VariantsTableData[];
  groupByOption: string;
}) {
  const form = useFormContext<ProductFormValues>();
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const getRowId = React.useCallback(
    (row: VariantsTableData, index: number) => {
      const key = Object.values(row.optionValues)
        .map((v) => v.id)
        .sort()
        .join("::");
      return key || String(index);
    },
    [],
  );

  const columns = React.useMemo<ColumnDef<VariantsTableData>[]>(
    () => [
      {
        id: "groupBy",
        header: "Group By",
        enableHiding: true,
        getGroupingValue: (row) => row.optionValues[groupByOption]?.value ?? "",
        cell: ({ getValue }) => {
          return <div>{getValue<string>()}</div>;
        },
      },

      {
        id: "variant",
        header: "Variant",
        minSize: 200,
        maxSize: 400,
        aggregationFn:
          "getChildRows" as unknown as AggregationFn<VariantsTableData>, //
        aggregatedCell: ({ row, getValue }) => {
          const childRows = getValue<VariantsTableData[]>();
          const optionValue =
            childRows[0]?.optionValues[groupByOption]?.value ?? "option value";

          return (
            <div className="flex cursor-pointer items-center gap-2">
              <div
                className={cn(
                  "relative size-12",
                  form.formState.errors.variants?.[row.index]?.thumbnail?.url &&
                    "ring-destructive rounded-lg ring-2",
                )}
              >
                {!childRows.some((child) => child.thumbnail.url) && (
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border">
                    <ImagePlusIcon className="size-4" />
                  </div>
                )}

                {childRows.map(
                  (child, index) =>
                    child.thumbnail.url && (
                      <div
                        key={`variant-agg-${row.id}-${index}`}
                        className="absolute top-0 left-0 size-12 overflow-hidden rounded-md border"
                        style={{
                          zIndex: index,
                          rotate: `${index * 20}deg`,
                          scale: `${1 - index * 0.1}`,
                        }}
                      >
                        <Image
                          src={child.thumbnail.url}
                          alt={child.thumbnail.url}
                          width={100}
                          height={100}
                          className="size-full object-cover"
                        />
                      </div>
                    ),
                )}
              </div>

              <div>
                <p className="font-medium">{optionValue}</p>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">
                    {childRows.length} variants
                  </p>
                  {row.getIsExpanded() ? (
                    <ChevronUpIcon className="size-4" />
                  ) : (
                    <ChevronDownIcon className="size-4" />
                  )}
                </div>
              </div>
            </div>
          );
        },

        cell: ({ row }) => {
          const name = Object.values(row.original.optionValues)
            .filter(
              (option) =>
                option.value !==
                row.original.optionValues[groupByOption]?.value,
            )
            .map((option) => option.value)
            .join(", ");

          return (
            <div className="ml-4 flex items-center gap-2">
              <VariantMediaDialog index={row.index} />

              {!name ? "What did you expect?" : name}
            </div>
          );
        },
      },

      {
        header: "Price",
        accessorKey: "overridePrice",
        minSize: 50,
        maxSize: 220,
        aggregatedCell: () => {
          return;
        },
        cell: ({ row }) => {
          const productPrice = form.getValues("price");

          return (
            <FormField
              control={form.control}
              name={`variants.${row.index}.overridePrice`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PriceInput placeholder={`${productPrice}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        },
      },

      {
        header: "Stock",
        accessorKey: "stock",
        enableResizing: false,
        size: 50,
        aggregatedCell: () => {
          return;
        },
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`variants.${row.index}.stock`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <NumberInput placeholder="Stock" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupByOption],
  );

  const grouping = React.useMemo(() => ["groupBy"], []);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { grouping, expanded },
    onExpandedChange: setExpanded,
    getRowId,
    autoResetExpanded: false,
    groupedColumnMode: "remove",
    aggregationFns: {
      getChildRows: (_, __, childRows) =>
        childRows.map((row) => row.original as VariantsTableData),
    },
    autoResetPageIndex: false,
  });

  return (
    <Table
      style={{ tableLayout: "fixed" }}
      containerClassName={cn(
        "border-t",
        form.formState.errors.variants &&
          "border-destructive border rounded-sm",
      )}
    >
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="[&_th]:border-r-0">
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className="w-full"
                style={{
                  width: `${header.column.getSize()}px`,
                  minWidth: `${header.column.getSize()}px`,
                  maxWidth: `${header.column.getSize()}px`,
                }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={() => row.toggleExpanded()}
            className={cn(
              "[&_td]:border-r-0",
              row.getIsExpanded() && "bg-muted",
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="w-full"
                style={{
                  width: `${cell.column.getSize()}px`,
                  minWidth: `${cell.column.getSize()}px`,
                  maxWidth: `${cell.column.getSize()}px`,
                }}
              >
                {cell.getIsAggregated()
                  ? flexRender(
                      cell.column.columnDef.aggregatedCell,
                      cell.getContext(),
                    )
                  : !cell.getIsPlaceholder() &&
                    flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function VariantMediaDialog({ index }: { index: number }) {
  const form = useFormContext<ProductFormValues>();

  const variant = useWatch({
    control: form.control,
    name: `variants.${index}`,
  });

  const { update } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  function handleChange(media: SelectedMedia[]) {
    update(index, {
      ...variant,
      thumbnail: { id: media[0]!.mediaId, url: media[0]!.url },
    });
  }

  function renderMedia() {
    if (!variant?.thumbnail.id) {
      return (
        <ImagePlusIcon className="group-hover:text-primary-foreground size-4" />
      );
    }

    return (
      <Image
        src={variant.thumbnail.url}
        alt="Thumbnail"
        className="size-full object-cover"
        width={100}
        height={100}
      />
    );
  }

  return (
    <MediaStoreProvider maxFiles={1}>
      <MediaDialog onChange={handleChange}>
        <button
          type="button"
          className={cn(
            "group hover:bg-muted flex size-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed transition-all hover:opacity-80",
            form.formState.errors.variants?.[index]?.thumbnail &&
              "border-destructive",
          )}
          data-invalid={Boolean(
            form.formState.errors.variants?.[index]?.thumbnail,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {renderMedia()}
        </button>
      </MediaDialog>
    </MediaStoreProvider>
  );
}
