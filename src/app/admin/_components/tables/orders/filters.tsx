"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, ListIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useOrderSearchParams } from "~/app/admin/_hooks/use-order-search-params";
import {
  findOrderPreset,
  orderPresets,
  type OrderPresetId,
} from "~/lib/orders/presets";
import { SearchInput } from "../../inputs/search-input";
import { orderStatusMap } from "./order-status";
import { useTRPC } from "~/trpc/client";

const presetIcons: Record<OrderPresetId, ReactNode> = {
  all: <ListIcon />,
  "to-ship": orderStatusMap.PENDING.icon,
  "out-for-delivery": orderStatusMap.SHIPPED.icon,
  delivered: orderStatusMap.DELIVERED.icon,
  cancelled: orderStatusMap.CANCELLED.icon,
  today: <CalendarIcon />,
};

/** The orders search, held in the search params. Rendered straight into the page's toolbar row. */
export function OrdersFilters() {
  const [filters, setFilters] = useOrderSearchParams();

  return (
    <SearchInput
      className="w-full sm:w-72"
      placeholder="Search name, phone or order #"
      aria-label="Search name, phone or order #"
      value={filters.search ?? ""}
      onChange={(event) =>
        void setFilters({ search: event.target.value || null })
      }
    />
  );
}

/**
 * The preset views as underline tabs over the list, each with its order
 * count. Picking one replaces the filters but keeps the search; the table's
 * header row draws the line the active underline sits on.
 */
export function OrderPresetTabs() {
  const trpc = useTRPC();
  const [filters, setFilters] = useOrderSearchParams();
  const { data: counts } = useQuery(
    trpc.admin.orders.queries.getPresetCounts.queryOptions(),
  );
  const activePreset = findOrderPreset(filters);

  return (
    <Tabs
      className="shrink-0 [scrollbar-width:none] overflow-x-auto px-3"
      value={activePreset?.id ?? null}
      onValueChange={(id: OrderPresetId) => {
        const preset = orderPresets.find((preset) => preset.id === id);
        if (preset) void setFilters(preset.filters);
      }}
    >
      <TabsList
        variant="line"
        aria-label="Order views"
        className="h-10 gap-5 p-0 group-data-horizontal/tabs:h-10"
      >
        {orderPresets.map((preset) => (
          <TabsTrigger
            key={preset.id}
            value={preset.id}
            className="h-full flex-none gap-1.5 rounded-none px-0.5 group-data-horizontal/tabs:after:bottom-0"
          >
            {presetIcons[preset.id]}
            {preset.label}
            {/* nothing until loaded; the page prefetches them, so this is rarely seen */}
            {counts && (
              <span className="text-muted-foreground text-xs tabular-nums">
                {counts[preset.id]}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
