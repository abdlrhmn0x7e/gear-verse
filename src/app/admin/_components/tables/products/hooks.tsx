import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs/server";

const productFiltersSearchParams = {
  title: parseAsString,
  brands: parseAsArrayOf(parseAsInteger),
};

export function useProductsFilterParams() {
  return useQueryStates(productFiltersSearchParams, { shallow: true });
}

export const loadProductFiltersSearchParams = createLoader(
  productFiltersSearchParams,
);
