export type ErrorKind =
  | "INTERNAL"
  | "VALIDATION"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT";

export class AppError extends Error {
  constructor(
    message: string,
    public kind: ErrorKind,
    public meta?: Record<string, unknown>,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
