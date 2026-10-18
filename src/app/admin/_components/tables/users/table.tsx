"use client";

import {
  keepPreviousData,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { UsersIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";
import { useUserSearchParams } from "../../../_hooks/use-user-search-params";
import { ListGrid, useListTable } from "../list-grid";
import { usersColumns } from "./columns";

export function UsersTable() {
  const trpc = useTRPC();
  const [params] = useUserSearchParams();
  const debouncedFilters = useDebounce(params);
  const {
    data: users,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    trpc.admin.users.queries.getManagePage.infiniteQueryOptions(
      {
        pageSize: 15,
        filters: {
          search: debouncedFilters.search ?? undefined,
          role: debouncedFilters.role ?? undefined,
          status: debouncedFilters.status ?? undefined,
        },
      },
      {
        placeholderData: keepPreviousData,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );

  const usersData = useMemo(
    () => users?.pages.flatMap((page) => page.data) ?? [],
    [users],
  );

  const { ref, inView } = useInView();

  const table = useListTable({
    data: usersData,
    columns: usersColumns,
    getRowId: (row) => row.id.toString(),
  });

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const filtered = [params.search, params.role, params.status].some(Boolean);

  return (
    <ListGrid
      table={table}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      loadMoreRef={ref}
      empty={
        filtered
          ? {
              title: "No users match these filters",
              description: "Try a different name, email, role or status.",
              icon: <UsersIcon />,
            }
          : {
              title: "No users yet",
              description:
                "People who create an account show up here. Guest checkouts don't.",
              icon: <UsersIcon />,
            }
      }
    />
  );
}
