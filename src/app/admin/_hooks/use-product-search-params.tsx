import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs/server";

const productSearchParams = {
  title: parseAsString,
  brands: parseAsArrayOf(parseAsInteger),
  productId: parseAsInteger,
};

export function useProductSearchParams() {
  return useQueryStates(productSearchParams, { shallow: true });
}

export const loadProductSearchParams = createLoader(productSearchParams);
