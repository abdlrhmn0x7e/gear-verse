import { useQueryStates } from "nuqs";
import { createLoader, parseAsBoolean } from "nuqs/server";

export const cartSearchParams = {
  cart: parseAsBoolean,
};

export function useCartSearchParams() {
  return useQueryStates(cartSearchParams, { shallow: true });
}
export const loadCartSearchParams = createLoader(cartSearchParams);
