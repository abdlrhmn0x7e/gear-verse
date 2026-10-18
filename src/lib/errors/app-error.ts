export type ErrorKind =
  | "INTERNAL"
  | "VALIDATION"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT";

export class AppError extends Error {
  public kind: ErrorKind;
  public meta?: Record<string, unknown>;

  /**
   * Callers pass the underlying error either as the fourth argument or as
   * `meta.cause`; both end up on the native `Error.cause`, which the tRPC
   * error map forwards.
   */
  constructor(
    message: string,
    kind: ErrorKind,
    meta?: Record<string, unknown>,
    cause?: unknown,
  ) {
    const resolvedCause = cause ?? meta?.cause;
    super(
      message,
      resolvedCause === undefined ? undefined : { cause: resolvedCause },
    );
    this.name = "AppError";
    this.kind = kind;
    this.meta = meta;
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
