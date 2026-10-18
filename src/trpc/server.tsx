/** eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { connection } from "next/server";
import { cache } from "react";
import { createTRPCContext } from "~/server/api/init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "~/server/api/_app";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export const api = appRouter.createCaller(createTRPCContext);

export async function HydrateClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // dehydrate() stamps each query with Date.now(), and with partialPrefetching a prefetch prerender resolves
  // searchParams and headers, so wait for the real request (see getSession)
  await connection();
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    await queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    await queryClient.prefetchQuery(queryOptions);
  }
}
