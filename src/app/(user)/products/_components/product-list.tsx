"use client";

import { api, type RouterOutputs } from "~/trpc/react";

export function ProductList() {
  const [data] = api.user.products.getPage.useSuspenseInfiniteQuery(
    {
      pageSize: 9,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const products = data.pages.flatMap((page) => page.data);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: RouterOutputs["user"]["products"]["getPage"]["data"][number];
}) {
  return <div>ProductCard</div>;
}
