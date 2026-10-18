"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PackageIcon } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import { formatMoney } from "./format";
import { Panel, PanelEmpty, PanelSkeleton } from "./panel";
import { periodLabels, useDashboardRange } from "./use-dashboard-range";

/** The best sellers of the period by units, each with a bar for its share of the top seller. */
export function TopProducts() {
  const trpc = useTRPC();
  const { range } = useDashboardRange();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.topProducts.queryOptions({ range }),
  );
  const most = data[0]?.units ?? 0;

  return (
    <Panel
      title="Top products"
      description={`By units sold ${periodLabels[range]}, leaving out cancelled and refunded orders`}
      link={{ href: "/admin/products", label: "Products" }}
    >
      {data.length === 0 ? (
        <PanelEmpty icon={<PackageIcon />}>
          Nothing sold {periodLabels[range]}.
        </PanelEmpty>
      ) : (
        <ol className="flex flex-col gap-3 pt-2">
          {data.map((product) => (
            <li key={product.productId} className="space-y-1.5">
              <div className="flex items-baseline gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate" title={product.title}>
                  {product.title}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {formatMoney(product.revenue)}
                </span>
                <span className="w-14 shrink-0 text-right font-medium tabular-nums">
                  {product.units} sold
                </span>
              </div>
              <div className="bg-accent h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-muted-foreground h-full rounded-full"
                  style={{
                    width: `${most > 0 ? (product.units / most) * 100 : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

export function TopProductsSkeleton() {
  return <PanelSkeleton title="Top products" rows={4} />;
}
