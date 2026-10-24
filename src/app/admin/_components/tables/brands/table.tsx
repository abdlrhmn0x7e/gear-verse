"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { TargetIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { useTRPC } from "~/trpc/client";
import { ListGrid, useListTable } from "../list-grid";
import { brandsColumns } from "./columns";

export function BrandsTable() {
  const trpc = useTRPC();
  const { data, isFetching, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.admin.brands.queries.getPage.infiniteQueryOptions(
        { pageSize: 20 },
        { getNextPageParam: (lastPage) => lastPage.nextCursor },
      ),
    );
  const brands = useMemo(() => data.pages.flatMap((page) => page.data), [data]);
  const { ref, inView } = useInView();
  const table = useListTable({
    data: brands,
    columns: brandsColumns,
    getRowId: (row) => row.id.toString(),
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  return (
    <ListGrid
      table={table}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      loadMoreRef={ref}
      empty={{
        title: "No brands yet",
        description: "Add a brand to use it when creating products.",
        icon: <TargetIcon />,
      }}
    />
  );
}
