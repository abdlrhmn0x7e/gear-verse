import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { isAppError } from "~/lib/errors/app-error";

export function errorMap(error: unknown) {
  if (env.NODE_ENV === "development") {
    console.error("ERROR: ", error);
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

  if (isUniqueViolation(error)) {
    return new TRPCError({
      code: "CONFLICT",
      message: "This record already exists, please check for duplicates",
      cause: error,
    });
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    cause: error,
  });
}

/**
 * Postgres raises `23505` (unique_violation) when an insert/update hits a
 * unique index. Drizzle re-throws the driver error, sometimes wrapped as `cause`.
 */
function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: unknown }).code;
  if (code === "23505") return true;

  const cause = (error as { cause?: unknown }).cause;
  return cause !== error && isUniqueViolation(cause);
}
