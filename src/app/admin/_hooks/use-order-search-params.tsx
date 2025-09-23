import { useQueryStates } from "nuqs";
import { createLoader, parseAsInteger, parseAsStringEnum } from "nuqs/server";

const orderSearchParams = {
  search: parseAsInteger,
  orderId: parseAsInteger,
  status: parseAsStringEnum([
    "PENDING",
    "SHIPPED",
    "DELIVERED",
    "REFUNDED",
    "CANCELLED",
  ]),
  paymentMethod: parseAsStringEnum(["COD"]),
};

export function useOrderSearchParams() {
  return useQueryStates(orderSearchParams, { shallow: true });
}

export const loadOrderSearchParams = createLoader(orderSearchParams);
