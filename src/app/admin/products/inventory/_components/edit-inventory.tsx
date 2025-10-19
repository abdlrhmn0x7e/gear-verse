"use client";

import {
  InventoryItemForm,
  type InventoryItemFormValues,
} from "~/app/admin/_components/forms/inventory-item-form";
import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/trpc/react";

export function EditInventory() {
  const [params] = useInventorySearchParams();
  const debouncedFilters = useDebounce(params);

  const [data] =
    api.admin.inventoryItems.queries.getPage.useSuspenseInfiniteQuery(
      {
        pageSize: 10,
        filters: {
          inventorySearch: debouncedFilters.inventorySearch ?? undefined,
        },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const items = data.pages.flatMap((page) => page.data);

  function onSubmit(data: InventoryItemFormValues) {
    console.log(data);
  }

  return (
    <div>
      <InventoryItemForm values={items} onSubmit={onSubmit} />
    </div>
  );
}
