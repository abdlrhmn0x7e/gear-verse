import {
  createLoader,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
} from "nuqs/server";

type FilterKey = `multi.${string}` | `select.${string}` | `bool.${string}`;
export type Filters = {
  [x: FilterKey]: string | boolean | string[] | null;
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

export const getParsers = (sp: URLSearchParams) =>
  Object.fromEntries(
    Array.from(sp?.keys() ?? [])
      .filter(
        (key) =>
          key.startsWith("multi.") ||
          key.startsWith("select.") ||
          key.startsWith("bool."),
      )
      .map((key) => [key, mapParsers(key)]),
  );

export const loadFilterSearchParams = (sp: Record<string, string>) =>
  createLoader(getParsers(new URLSearchParams(sp)))(sp);
