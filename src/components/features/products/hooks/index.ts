import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

export const productsNuqsParsers = {
  categories: parseAsArrayOf(parseAsString),
  brands: parseAsArrayOf(parseAsString),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sortBy: parseAsStringEnum(["newest", "oldest", "price-asc", "price-desc"]),
};

export function useAllProductSearchParams() {
  return useQueryStates(productsNuqsParsers, { shallow: true });
}

export const loadAllProductSearchParams = createLoader(productsNuqsParsers);
