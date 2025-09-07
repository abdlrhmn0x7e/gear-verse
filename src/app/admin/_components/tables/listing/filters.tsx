"use client";

import { debounce } from "nuqs";
import { SearchInput } from "../../inputs/search-input";
import { useListingSearchParams } from "../../../_hooks/use-listing-search-params";

export function ListingsTableFilters() {
  const [params, setParams] = useListingSearchParams();

  return (
    <SearchInput
      value={params.title ?? ""}
      onChange={(e) =>
        setParams(
          { ...params, title: e.target.value },
          { limitUrlUpdates: debounce(500) },
        )
      }
      className="max-w-sm"
    />
  );
}
