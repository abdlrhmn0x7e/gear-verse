import { useQueryStates } from "nuqs";
import type { Locale } from "~/i18n/routing";
import type { ProductsGetPageInput } from "~/lib/schemas/contracts/public/products";
import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server";

export const productsNuqsParsers = {
  title: parseAsString,
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

type ProductsSearchParams = Awaited<
  ReturnType<typeof loadAllProductSearchParams>
>;

/** One mapping from URL filters to the products query, shared by the server prefetch and the client list. */
export function toProductsPageInput(
  filters: ProductsSearchParams,
  locale: Locale,
): ProductsGetPageInput {
  const hasPrice = filters.minPrice !== null || filters.maxPrice !== null;

  return {
    pageSize: 12,
    filters: {
      title: filters.title ?? undefined,
      brands: filters.brands ?? undefined,
      categories: filters.categories ?? undefined,
      price: hasPrice
        ? { min: filters.minPrice ?? 0, max: filters.maxPrice ?? 99999 }
        : undefined,
    },
    sortBy: filters.sortBy ?? "trending",
    locale,
  };
}
