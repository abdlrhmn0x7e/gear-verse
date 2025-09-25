import { useQueryStates } from "nuqs";
import { createLoader, parseAsInteger } from "nuqs/server";

const ordersSearchParams = {
  orderId: parseAsInteger,
};

export function useOrdersSearchParams() {
  return useQueryStates(ordersSearchParams, { shallow: true });
}

export const loadOrderSearchParams = createLoader(ordersSearchParams);
