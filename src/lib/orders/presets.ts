import type { OrdersFilter } from "~/lib/schemas/contracts/admin/orders";

export type OrderPresetFilters = {
  status: OrdersFilter["status"] | null;
  placed: OrdersFilter["placed"] | null;
};

/**
 * Saved views of the orders list, shared by its tabs and the server's counts.
 * A preset is active when the list's filters match it exactly.
 */
export const orderPresets = [
  {
    id: "all",
    label: "All",
    filters: { status: null, placed: null },
  },
  {
    id: "to-ship",
    label: "To ship",
    filters: { status: "PENDING", placed: null },
  },
  {
    id: "out-for-delivery",
    label: "Out for delivery",
    filters: { status: "SHIPPED", placed: null },
  },
  {
    id: "delivered",
    label: "Delivered",
    filters: { status: "DELIVERED", placed: null },
  },
  {
    id: "cancelled",
    label: "Cancelled",
    filters: { status: "CANCELLED", placed: null },
  },
  {
    id: "today",
    label: "Placed today",
    filters: { status: null, placed: "today" },
  },
] as const satisfies readonly {
  id: string;
  label: string;
  filters: OrderPresetFilters;
}[];

export type OrderPresetId = (typeof orderPresets)[number]["id"];

export function findOrderPreset(filters: OrderPresetFilters) {
  return orderPresets.find(
    (preset) =>
      preset.filters.status === filters.status &&
      preset.filters.placed === filters.placed,
  );
}
