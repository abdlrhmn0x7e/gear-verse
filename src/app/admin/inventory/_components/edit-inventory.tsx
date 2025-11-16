"use client";

import {
  keepPreviousData,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  InventoryItemForm,
  type InventoryItemFormValues,
} from "~/app/admin/_components/forms/inventory-item-form";
import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";

export function EditInventory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [params] = useInventorySearchParams();
  const debouncedFilters = useDebounce(params);

  const { data } = useSuspenseInfiniteQuery(
    trpc.admin.inventoryItems.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: {
          inventorySearch: debouncedFilters.inventorySearch ?? undefined,
        },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
      },
    ),
  );
  const items = useMemo(() => data.pages.flatMap((page) => page.data), [data]);

  const { mutate: updateInventoryItem, isPending } = useMutation(
    trpc.admin.inventoryItems.mutations.updateMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.admin.inventoryItems.queries.getPage.queryKey(),
        });
        toast.success("Inventory updated successfully");
      },
    }),
  );

  function onSubmit(data: InventoryItemFormValues) {
    updateInventoryItem(data);
  }

  return (
    <div className="bg-background rounded-lg">
      <InventoryItemForm
        values={items}
        onSubmit={onSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}
