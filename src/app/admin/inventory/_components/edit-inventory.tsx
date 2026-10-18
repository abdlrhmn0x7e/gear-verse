"use client";

import {
  keepPreviousData,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import {
  InventoryItemForm,
  type InventoryItemFormValues,
} from "~/app/admin/_components/forms/inventory-item-form";
import { InventoryTable } from "~/app/admin/_components/tables/inventory/table";
import { useInventorySearchParams } from "~/app/admin/_hooks/use-inventory-search-params";
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";

export function EditInventory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [params] = useInventorySearchParams();
  const debouncedFilters = useDebounce(params);

  const { data, isFetching, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
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

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const { mutateAsync: updateInventoryItems, isPending } = useMutation(
    trpc.admin.inventoryItems.mutations.updateMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.admin.inventoryItems.queries.getPage.queryKey(),
        });
        toast.success("Inventory updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't save the inventory");
      },
    }),
  );

  function onSubmit(changes: InventoryItemFormValues) {
    return updateInventoryItems(changes);
  }

  return (
    <InventoryItemForm
      values={items}
      onSubmit={onSubmit}
      isSubmitting={isPending}
    >
      <InventoryTable
        data={items}
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        loadMoreRef={ref}
        searched={Boolean(params.inventorySearch)}
      />
    </InventoryItemForm>
  );
}
