import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";
import { arabicStatuses } from "~/lib/arabic";

const productSearchParams = {
  id: parseAsInteger,
  title: parseAsString,
  slug: parseAsString,
  brands: parseAsArrayOf(parseAsInteger),
  categories: parseAsArrayOf(parseAsInteger),
  arabic: parseAsArrayOf(parseAsStringLiteral(arabicStatuses)),
};

export function useProductSearchParams() {
  return useQueryStates(productSearchParams, { shallow: true });
}

export const loadProductSearchParams = createLoader(productSearchParams);
