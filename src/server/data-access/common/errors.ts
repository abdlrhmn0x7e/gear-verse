/**
 * Postgres raises `42P01` (undefined_table) when a query names a table that
 * does not exist, e.g. before its migration has run. Drizzle re-throws the
 * driver error, sometimes wrapped as `cause`.
 */
export function isUndefinedTable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: unknown }).code;
  if (code === "42P01") return true;

  const cause = (error as { cause?: unknown }).cause;
  return cause !== error && isUndefinedTable(cause);
}
