"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { PinIcon, PinOffIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import type { ProductRow } from "./columns";

type ProductsPage = RouterOutput["admin"]["products"]["queries"]["getPage"];

// one at a time, so a quick second drag can't land before the first
const scope = { id: "pinned-products" };

/**
 * Pin, unpin and reorder with the list updated before the server answers.
 * The pinned group and the paged rows below it are separate queries, so a pin
 * moves the row from one to the other; a failure puts both back.
 */
export function useProductPins() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const pinnedFilter = trpc.admin.products.queries.getPinned.queryFilter();
  const pagesFilter = trpc.admin.products.queries.getPage.infiniteQueryFilter();

  async function applyOptimistic({
    pinned,
    pages,
  }: {
    pinned: (rows: ProductRow[]) => ProductRow[];
    pages?: (data: InfiniteData<ProductsPage>) => InfiniteData<ProductsPage>;
  }) {
    await Promise.all([
      queryClient.cancelQueries(pinnedFilter),
      queryClient.cancelQueries(pagesFilter),
    ]);
    const snapshot: [QueryKey, unknown][] = [
      ...queryClient.getQueriesData(pinnedFilter),
      ...queryClient.getQueriesData(pagesFilter),
    ];

    queryClient.setQueriesData<ProductRow[]>(
      pinnedFilter,
      (rows) => rows && pinned(rows),
    );
    if (pages) {
      queryClient.setQueriesData<InfiniteData<ProductsPage>>(
        pagesFilter,
        (data) => data && pages(data),
      );
    }

    return { snapshot };
  }

  function rollback(context: { snapshot: [QueryKey, unknown][] } | undefined) {
    context?.snapshot.forEach(([key, data]) =>
      queryClient.setQueryData(key, data),
    );
  }

  const shared = {
    scope,
    onSettled: async () => {
      // a later pin or move is still queued; its own refetch covers this one
      const queued = queryClient.isMutating({
        predicate: (mutation) => mutation.options.scope?.id === scope.id,
      });
      if (queued > 1) return;
      await Promise.all([
        queryClient.invalidateQueries(pinnedFilter),
        queryClient.invalidateQueries(pagesFilter),
      ]);
    },
  };

  const pin = useMutation(
    trpc.admin.products.mutations.pin.mutationOptions({
      ...shared,
      onMutate: ({ id }) => {
        const row = findRow(id);
        return applyOptimistic({
          pinned: (rows) =>
            row
              ? [
                  { ...row, pinnedPosition: 0 },
                  ...rows.filter((r) => r.id !== id),
                ]
              : rows,
          pages: (data) =>
            mapRows(data, (rows) => rows.filter((r) => r.id !== id)),
        });
      },
      onSuccess: () => toast.success("Pinned to home"),
      onError: (_error, _input, context) => {
        rollback(context);
        toast.error("Couldn't pin the product");
      },
    }),
  );

  const unpin = useMutation(
    trpc.admin.products.mutations.unpin.mutationOptions({
      ...shared,
      onMutate: ({ id }) => {
        const row = findRow(id);
        return applyOptimistic({
          pinned: (rows) => rows.filter((r) => r.id !== id),
          pages: (data) =>
            row ? insertById(data, { ...row, pinnedPosition: null }) : data,
        });
      },
      onSuccess: () => toast.success("Unpinned"),
      onError: (_error, _input, context) => {
        rollback(context);
        toast.error("Couldn't unpin the product");
      },
    }),
  );

  const reorder = useMutation(
    trpc.admin.products.mutations.reorderPinned.mutationOptions({
      ...shared,
      onMutate: ({ ids }) =>
        applyOptimistic({
          pinned: (rows) =>
            ids.flatMap((id) => rows.find((r) => r.id === id) ?? []),
        }),
      onError: (_error, _input, context) => {
        rollback(context);
        toast.error("Couldn't save the new order");
      },
    }),
  );

  function findRow(id: number) {
    const cached = [
      ...queryClient
        .getQueriesData<ProductRow[]>(pinnedFilter)
        .flatMap(([, rows]) => rows ?? []),
      ...queryClient
        .getQueriesData<InfiniteData<ProductsPage>>(pagesFilter)
        .flatMap(([, data]) => data?.pages.flatMap((page) => page.data) ?? []),
    ];
    return cached.find((row) => row.id === id);
  }

  return {
    pin: (id: number) => pin.mutate({ id }),
    unpin: (id: number) => unpin.mutate({ id }),
    reorder: (ids: number[]) => reorder.mutate({ ids }),
  };
}

function mapRows(
  data: InfiniteData<ProductsPage>,
  fn: (rows: ProductRow[]) => ProductRow[],
): InfiniteData<ProductsPage> {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, data: fn(page.data) })),
  };
}

/** Puts an unpinned row back in its id-ordered place, if that place is loaded yet. */
function insertById(
  data: InfiniteData<ProductsPage>,
  row: ProductRow,
): InfiniteData<ProductsPage> {
  const pageIndex = data.pages.findIndex(
    (page, index) =>
      page.data.some((r) => r.id > row.id) ||
      (index === data.pages.length - 1 && page.nextCursor === null),
  );
  if (pageIndex === -1) return data;

  return {
    ...data,
    pages: data.pages.map((page, index) => {
      if (index !== pageIndex) return page;
      const at = page.data.findIndex((r) => r.id > row.id);
      const rows = [...page.data];
      rows.splice(at === -1 ? rows.length : at, 0, row);
      return { ...page, data: rows };
    }),
  };
}

export function PinToggle({ id, pinned }: { id: number; pinned: boolean }) {
  const { pin, unpin } = useProductPins();
  const label = pinned ? "Unpin" : "Pin to home";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={(event) => {
              event.stopPropagation();
              if (pinned) unpin(id);
              else pin(id);
            }}
          />
        }
      >
        {pinned ? <PinOffIcon /> : <PinIcon />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
