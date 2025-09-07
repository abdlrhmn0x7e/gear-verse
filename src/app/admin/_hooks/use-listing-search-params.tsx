import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

const listingsSearchParams = {
  title: parseAsString,
  listingId: parseAsInteger,
  type: parseAsStringEnum(["create", "edit"]),
};

export function useListingSearchParams() {
  return useQueryStates(listingsSearchParams, { shallow: true });
}

export const loadListingSearchParams = createLoader(listingsSearchParams);
