import { TRPCError } from "@trpc/server";
import { isAppError } from "~/lib/errors/app-error";

export function errorMap(error: unknown) {
  if (isAppError(error)) {
    switch (error.kind) {
      case "NOT_FOUND":
        return new TRPCError({
          code: "NOT_FOUND",
          cause: error.cause,
          ...error,
        });
      case "BAD_REQUEST":
        return new TRPCError({
          code: "BAD_REQUEST",
          cause: error.cause,
          ...error,
        });
      case "CONFLICT":
        return new TRPCError({
          code: "CONFLICT",
          cause: error.cause,
          ...error,
        });
      case "INTERNAL":
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error.cause,
        });
      default:
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error.cause,
          ...error,
        });
    }
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    cause: error,
  });
}
