"use client";

import {
  keepPreviousData,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "~/components/ui/toast";
import {
  InventoryItemForm,
  type InventoryItemFormValues,
} from "~/app/admin/_components/forms/inventory-item-form";
import { InventoryTable } from "~/app/admin/_components/tables/inventory/table";
import type {
  InventoryItemNode,
  InventoryItemRow,
  InventoryNode,
  InventoryProductRow,
} from "~/app/admin/_components/tables/inventory/columns";
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
  const { nodes, items } = useMemo(
    () => toInventoryTree(data.pages.flatMap((page) => page.data)),
    [data],
  );

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const { mutateAsync: updateInventoryItems, isPending } = useMutation(
    trpc.admin.inventoryItems.mutations.updateMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.admin.inventoryItems.queries.getPage.pathFilter(),
        );
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
        data={nodes}
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        loadMoreRef={ref}
        searched={Boolean(params.inventorySearch)}
      />
    </InventoryItemForm>
  );
}

/**
 * One row per product: a product without variants is its own stock row, one
 * with variants groups a row per variant. `items` is every stock row in tree
 * order, the form's rows, and each item node knows its place in it.
 */
function toInventoryTree(products: InventoryProductRow[]) {
  const items: InventoryItemRow[] = [];

  function toItemNode(
    key: string,
    productId: number,
    item: InventoryItemRow,
    title: string,
    thumbnailUrl: string | null,
  ): InventoryItemNode {
    const formIndex = items.push(item) - 1;
    return {
      kind: "item",
      key,
      productId,
      item: { ...item, formIndex },
      title,
      thumbnailUrl,
    };
  }

  const nodes = products.map((product): InventoryNode => {
    const [only] = product.items;
    if (product.items.length === 1 && only && !only.productVariantId) {
      return toItemNode(
        `p-${product.id}`,
        product.id,
        only,
        product.title,
        product.thumbnailUrl,
      );
    }

    return {
      kind: "group",
      key: `p-${product.id}`,
      productId: product.id,
      title: product.title,
      thumbnailUrl: product.thumbnailUrl,
      variants: product.items.map((item) =>
        toItemNode(
          `i-${item.id}`,
          product.id,
          item,
          // a product level row left over from before the product had variants
          item.productVariantId
            ? item.values.filter(Boolean).join(" / ") || "Variant"
            : "No variant",
          item.thumbnailUrl,
        ),
      ),
    };
  });

  return { nodes, items };
}
