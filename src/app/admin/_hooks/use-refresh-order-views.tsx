"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useTRPC } from "~/trpc/client";

/**
 * Everything an order change can move: the order lists and details, stock
 * (orders reserve it and cancelling restocks), the dashboard's queue and
 * totals, and each user's order count.
 */
export function useRefreshOrderViews() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries(trpc.admin.orders.pathFilter()),
        queryClient.invalidateQueries(trpc.admin.inventoryItems.pathFilter()),
        queryClient.invalidateQueries(trpc.admin.dashboard.pathFilter()),
        queryClient.invalidateQueries(trpc.admin.users.pathFilter()),
      ]),
    [queryClient, trpc],
  );
}
