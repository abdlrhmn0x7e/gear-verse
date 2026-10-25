import {
  createLoader,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  type SingleParserBuilder,
} from "nuqs/server";

export type AttributeFilterKey<T extends "multi" | "select" | "bool"> =
  `${T}.${string}`;
export type AttributeFilterValue<T extends "multi" | "select" | "bool"> =
  T extends "multi"
    ? string[]
    : T extends "select"
      ? string
      : T extends "bool"
        ? boolean
        : unknown;
export type AttributeFilter<T extends "multi" | "select" | "bool"> = {
  type: AttributeFilterKey<T>;
  value: AttributeFilterValue<T>;
};
export type CategoryProductsFilters = {
  brands: string[] | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: "newest" | "oldest" | "price-asc" | "price-desc" | null;
  [x: `multi.${string}`]: string[] | null;
  [x: `select.${string}`]: string | null;
  [x: `bool.${string}`]: boolean | null;
};

export type CategoryProductsFiltersParsers = {
  brands: SingleParserBuilder<string[]>;
  minPrice: SingleParserBuilder<number>;
  maxPrice: SingleParserBuilder<number>;
  sortBy: SingleParserBuilder<"newest" | "oldest" | "price-asc" | "price-desc">;
  [x: `multi.${string}`]: SingleParserBuilder<string[]>;
  [x: `select.${string}`]: SingleParserBuilder<string>;
  [x: `bool.${string}`]: SingleParserBuilder<boolean>;
};

function mapParsers(key: string) {
  if (key.startsWith("multi.")) {
    return parseAsArrayOf(parseAsString).withOptions({ shallow: true });
  }

  if (key.startsWith("select.")) {
    return parseAsString.withOptions({ shallow: true });
  }

  if (key.startsWith("bool.")) {
    return parseAsBoolean.withOptions({ shallow: true });
  }

  return parseAsString.withOptions({ shallow: true });
}

const productsNuqsParsers = {
  brands: parseAsArrayOf(parseAsString),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sortBy: parseAsStringEnum(["newest", "oldest", "price-asc", "price-desc"]),
};

export const getParsers = (
  sp: URLSearchParams,
): CategoryProductsFiltersParsers => ({
  ...Object.fromEntries(
    Array.from(sp?.keys() ?? [])
      .filter(
        (key) =>
          key.startsWith("multi.") ||
          key.startsWith("select.") ||
          key.startsWith("bool."),
      )
      .map((key) => [key, mapParsers(key)]),
  ),
  ...productsNuqsParsers,
});

export const loadFilterSearchParams = (sp: Record<string, string>) =>
  createLoader(getParsers(new URLSearchParams(sp)))(sp);
