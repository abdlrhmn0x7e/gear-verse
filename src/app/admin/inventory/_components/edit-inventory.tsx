"use client";

import {
  keepPreviousData,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
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
import { useTRPC } from "~/trpc/client";

export function EditInventory() {
  const [params] = useInventorySearchParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const debouncedFilters = useDebounce(params);

  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    trpc.admin.inventoryItems.queries.getPage.infiniteQueryOptions(
      {
        pageSize: 10,
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
  const items = data.pages.flatMap((page) => page.data);

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
