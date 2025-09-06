import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs/server";

const productFilterSearchParams = {
  title: parseAsString,
  brands: parseAsArrayOf(parseAsInteger),
};

export function useProductsFilterParams() {
  return useQueryStates(productFilterSearchParams, { shallow: true });
}

export const loadProductFiltersSearchParams = createLoader(
  productFilterSearchParams,
);
