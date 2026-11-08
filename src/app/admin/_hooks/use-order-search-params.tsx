import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import type { OrdersFilter } from "~/lib/schemas/contracts/admin/orders";
import { dashboardRanges } from "~/server/application/helpers/dashboard-range";

const orderSearchParams = {
  search: parseAsString,
  orderId: parseAsInteger,
  editId: parseAsInteger,
  status: parseAsStringEnum([
    "PENDING",
    "SHIPPED",
    "DELIVERED",
    "REFUNDED",
    "CANCELLED",
  ]),
  paymentMethod: parseAsStringEnum(["COD", "ONLINE"]),
  placed: parseAsStringEnum([...dashboardRanges]),
  create: parseAsBoolean,
};

export function useOrderSearchParams() {
  return useQueryStates(orderSearchParams, { shallow: true });
}

export const loadOrderSearchParams = createLoader(orderSearchParams);

type OrderFilterParams = {
  search: string | null;
  status: OrdersFilter["status"] | null;
  paymentMethod: OrdersFilter["paymentMethod"] | null;
  placed: OrdersFilter["placed"] | null;
};

/** The list's query filters; the page's prefetch and the table must build the same key. */
export function toOrdersFilter(params: OrderFilterParams) {
  return {
    search: params.search ?? undefined,
    status: params.status ?? undefined,
    paymentMethod: params.paymentMethod ?? undefined,
    placed: params.placed ?? undefined,
  };
}
