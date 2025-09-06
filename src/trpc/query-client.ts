import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,

        retry: (count, error) => {
          const toAttempt = isServer ? 0 : 3;

          if (!isTRPCClientError(error) || !error.data) {
            return toAttempt < count;
          }

          const httpStatus = (error.data as { httpStatus: number }).httpStatus;
          if (httpStatus >= 400 && httpStatus < 500) {
            return false;
          }

          return toAttempt < count;
        },
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
