"use client";

import { debounce, useQueryState } from "nuqs";
import { parseAsString } from "nuqs";
import { SearchInput } from "./search-input";

export function TestSearch() {
  const [title, setTitle] = useQueryState(
    "title",
    parseAsString.withOptions({
      shallow: false,
    }),
  );

  return (
    <div className="p-2">
      <SearchInput
        className="max-w-xs"
        defaultValue={title ?? ""}
        onChange={(e) =>
          setTitle(e.target.value, { limitUrlUpdates: debounce(500) })
        }
      />
    </div>
  );
}
