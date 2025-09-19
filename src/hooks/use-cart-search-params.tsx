import { createLoader, useQueryStates } from "nuqs";
import { parseAsBoolean } from "nuqs/server";

export const cartSearchParams = {
  cart: parseAsBoolean,
};

export function useCartSearchParams() {
  return useQueryStates(cartSearchParams, { shallow: true });
}
export const loadCartSearchParams = createLoader(cartSearchParams);
