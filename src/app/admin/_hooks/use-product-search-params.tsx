import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs/server";

const productSearchParams = {
  id: parseAsInteger,
  title: parseAsString,
  slug: parseAsString,
  brands: parseAsArrayOf(parseAsInteger),
  categories: parseAsArrayOf(parseAsInteger),
};

export function useProductSearchParams() {
  return useQueryStates(productSearchParams);
}

export const loadProductSearchParams = createLoader(productSearchParams);
