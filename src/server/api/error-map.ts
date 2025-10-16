import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { isAppError } from "~/lib/errors/app-error";

export function errorMap(error: unknown) {
  if (env.NODE_ENV === "development") {
    console.error("ERROR: ", JSON.stringify(error, null, 4));
  }

  if (isAppError(error)) {
    switch (error.kind) {
      case "NOT_FOUND":
        return new TRPCError({
          code: "NOT_FOUND",
          cause: error.cause,
          message: error.message,
        });
      case "BAD_REQUEST":
        return new TRPCError({
          code: "BAD_REQUEST",
          cause: error.cause,
          message: error.message,
        });
      case "CONFLICT":
        return new TRPCError({
          code: "CONFLICT",
          cause: error.cause,
          message: error.message,
        });
      case "INTERNAL":
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error.cause,
          message: error.message,
        });
      default:
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: error.cause,
          message: error.message,
        });
    }
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    cause: error,
  });
}
