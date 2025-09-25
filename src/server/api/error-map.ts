import { TRPCError } from "@trpc/server";
import { isAppError } from "~/lib/errors/app-error";

export function errorMap(error: unknown) {
  if (isAppError(error)) {
    switch (error.kind) {
      case "NOT_FOUND":
        return new TRPCError({ code: "NOT_FOUND", message: error.message });
      case "BAD_REQUEST":
        return new TRPCError({ code: "BAD_REQUEST", message: error.message });
      case "CONFLICT":
        return new TRPCError({ code: "CONFLICT", message: error.message });
      case "INTERNAL":
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      default:
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
    }
  }

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
}
