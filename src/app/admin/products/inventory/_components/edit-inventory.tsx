"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import {
  InventoryItemForm,
  type InventoryItemFormValues,
} from "~/app/admin/_components/forms/inventory-item-form";
import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { LoadMore } from "~/components/load-more";
import { useDebounce } from "~/hooks/use-debounce";
import { api } from "~/trpc/react";

export function EditInventory() {
  const [params] = useInventorySearchParams();
  const debouncedFilters = useDebounce(params);

  const [data, { hasNextPage, fetchNextPage }] =
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

  const utils = api.useUtils();
  const { mutate: updateInventoryItem, isPending } =
    api.admin.inventoryItems.mutations.updateMany.useMutation({
      onSuccess: () => {
        void utils.admin.inventoryItems.queries.getPage.invalidate();
        toast.success("Inventory updated successfully");
      },
    });

  function onSubmit(data: InventoryItemFormValues) {
    updateInventoryItem(data.inventory);
  }

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="bg-background rounded-lg">
      <InventoryItemForm
        values={items}
        onSubmit={onSubmit}
        isSubmitting={isPending}
      />

      <LoadMore ref={ref} hasNextPage={hasNextPage} />
    </div>
  );
}
