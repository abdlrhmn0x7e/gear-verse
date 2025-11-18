import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

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
  create: parseAsBoolean,
};

export function useOrderSearchParams() {
  return useQueryStates(orderSearchParams, { shallow: true });
}

export const loadOrderSearchParams = createLoader(orderSearchParams);
