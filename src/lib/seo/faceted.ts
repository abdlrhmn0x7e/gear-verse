/**
 * Query params that only filter, sort or open a drawer on a listing. The
 * listing they produce is a copy of the clean page, so it isn't indexed.
 */
const FACET_PARAMS = new Set([
  "categories",
  "brands",
  "minPrice",
  "maxPrice",
  "sortBy",
  "cart",
]);
const FACET_PREFIXES = ["multi.", "select.", "bool."];

export function isFacetedSearch(searchParams: URLSearchParams) {
  for (const key of searchParams.keys()) {
    if (
      FACET_PARAMS.has(key) ||
      FACET_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
      return true;
    }
  }
  return false;
}

/** The listings that take facet params: the store and the category pages. */
export function isListingPath(pathname: string) {
  return pathname === "/products" || /^\/categories\/[^/]+\/?$/.test(pathname);
}
