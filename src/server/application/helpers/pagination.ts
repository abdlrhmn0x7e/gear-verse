import { AppError } from "~/lib/errors/app-error";
import type { Pagination } from "~/lib/schemas/contracts/pagination";
import type { Pagination as DataPagination } from "~/server/data-access/common/types";
import { base64DecodeNumber, base64EncodeNumber } from "~/lib/utils/base64";
import { tryCatch } from "~/lib/utils/try-catch";

export async function paginate<
  T extends Record<string, unknown> & { id: number },
  J extends Pagination,
>({
  input,
  getPage,
}: {
  input: J;
  getPage: (input: DataPagination) => Promise<Array<T>>;
}) {
  const { cursor: encodedCursor, ...rest } = input;
  const cursor = encodedCursor ? base64DecodeNumber(encodedCursor) : undefined;

  const { data, error } = await tryCatch(
    getPage({
      cursor,
      ...rest,
    }),
  );

  if (error) {
    console.error("pagination error", error);
    throw new AppError("Failed to get page", "INTERNAL", undefined, error);
  }

  const hasNextPage = data.length > input.pageSize && !!data.pop();
  const lastItem = data[data.length - 1];
  if (!lastItem) {
    return { data: [] as T[], nextCursor: null };
  }

  const nextCursor = hasNextPage ? base64EncodeNumber(lastItem.id) : null;

  return {
    data,
    nextCursor,
  };
}
