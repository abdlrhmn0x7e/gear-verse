import { useQueryStates } from "nuqs";
import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

const listingsSearchParams = {
  title: parseAsString,
  listingId: parseAsInteger,
};

export function useListingSearchParams() {
  return useQueryStates(listingsSearchParams, { shallow: true });
}

export const loadListingSearchParams = createLoader(listingsSearchParams);
