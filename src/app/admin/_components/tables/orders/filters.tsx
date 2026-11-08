"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCardIcon, HandCoinsIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useOrderSearchParams } from "~/app/admin/_hooks/use-order-search-params";
import {
  findOrderPreset,
  orderPresets,
  type OrderPresetId,
} from "~/lib/orders/presets";
import { FilterPill } from "../../filter-pill";
import { SearchInput } from "../../inputs/search-input";
import { orderStatuses, orderStatusMap } from "./order-status";
import { useTRPC } from "~/trpc/client";

const paymentMethods = [
  { value: "COD", label: "Cash on Delivery", icon: <HandCoinsIcon /> },
  { value: "ONLINE", label: "Online Payment", icon: <CreditCardIcon /> },
] as const;

const statusOptions = orderStatuses.map((status) => ({
  value: status,
  label: orderStatusMap[status].label,
  icon: orderStatusMap[status].icon,
}));

const placedOptions = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

/**
 * Preset views, then a search and the status, payment and date pills, all held
 * in the orders search params. Rendered straight into the page's toolbar row.
 */
export function OrdersFilters() {
  const [filters, setFilters] = useOrderSearchParams();

  return (
    <>
      {/* on phones the views sit here and scroll sideways; wider screens show them on the title line */}
      <OrderPresetTabs className="-mx-4 w-[calc(100%+2rem)] [scrollbar-width:none] overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:px-0 lg:hidden" />
      <SearchInput
        className="w-full sm:w-64"
        placeholder="Search name, phone or order #"
        aria-label="Search name, phone or order #"
        value={filters.search ?? ""}
        onChange={(event) =>
          void setFilters({ search: event.target.value || null })
        }
      />
      <FilterPill
        label="Status"
        value={filters.status}
        options={statusOptions}
        onChange={(status) => void setFilters({ status })}
      />
      <FilterPill
        label="Payment"
        value={filters.paymentMethod}
        options={paymentMethods}
        onChange={(paymentMethod) => void setFilters({ paymentMethod })}
      />
      <FilterPill
        label="Placed"
        value={filters.placed}
        options={placedOptions}
        onChange={(placed) => void setFilters({ placed })}
      />
    </>
  );
}

/** The preset views as tabs, each with its order count; picking one replaces the filters but keeps the search. */
export function OrderPresetTabs({ className }: { className?: string }) {
  const trpc = useTRPC();
  const [filters, setFilters] = useOrderSearchParams();
  const { data: counts } = useQuery(
    trpc.admin.orders.queries.getPresetCounts.queryOptions(),
  );
  const activePreset = findOrderPreset(filters);

  return (
    <div className={className}>
      <Tabs
        value={activePreset?.id ?? null}
        onValueChange={(id: OrderPresetId) => {
          const preset = orderPresets.find((preset) => preset.id === id);
          if (preset) void setFilters(preset.filters);
        }}
      >
        <TabsList aria-label="Order views">
          {orderPresets.map((preset) => (
            <TabsTrigger key={preset.id} value={preset.id}>
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
      </Tabs>{" "}
    </div>
  );
}
