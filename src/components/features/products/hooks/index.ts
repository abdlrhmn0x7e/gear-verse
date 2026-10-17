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

type ProductsSearchParams = Awaited<ReturnType<typeof loadAllProductSearchParams>>;

/** One mapping from URL filters to the products query, shared by the server prefetch and the client list. */
export function toProductsPageInput(filters: ProductsSearchParams) {
  const hasPrice = filters.minPrice !== null || filters.maxPrice !== null;

  return {
    pageSize: 12,
    filters: {
      brands: filters.brands ?? undefined,
      categories: filters.categories ?? undefined,
      price: hasPrice
        ? { min: filters.minPrice ?? 0, max: filters.maxPrice ?? 99999 }
        : undefined,
    },
    sortBy: filters.sortBy ?? undefined,
  };
}
