import { AppError } from "~/lib/errors/app-error";
import type { Pagination } from "~/lib/schemas/contracts/pagination";
import { base64DecodeNumber, base64EncodeNumber } from "~/lib/utils/base64";
import { tryCatch } from "~/lib/utils/try-catch";

export async function paginate<
  T extends Record<string, unknown> & { id: number },
>({
  input,
  getPage,
}: {
  input: Pagination & { filters?: Record<string, unknown> };
  getPage: (options: {
    cursor: number | undefined;
    pageSize: number;
  }) => Promise<Array<T>>;
}) {
  const { cursor: encodedCursor, ...rest } = input;
  console.log("rest", rest);
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
