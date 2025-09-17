import type { ForwardedRef } from "react";
import { Spinner } from "./spinner";

export function LoadMore({
  hasNextPage,
  ref,
}: {
  hasNextPage: boolean;
  ref: ForwardedRef<HTMLDivElement>;
}) {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4" ref={ref}>
      <Spinner />
    </div>
  );
}
