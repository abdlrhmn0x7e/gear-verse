"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PackageCheckIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/reui/badge";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import { Panel, PanelEmpty, PanelSkeleton } from "./panel";

/** The emptiest stock rows on sale, each a link to its row in the inventory. */
export function LowStockList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.lowStock.queryOptions(),
  );

  return (
    <Panel
      title="Low stock"
      link={{ href: "/admin/inventory", label: "Inventory" }}
    >
      {data.items.length === 0 ? (
        <PanelEmpty icon={<PackageCheckIcon />}>
          Everything on sale has more than {data.threshold} left.
        </PanelEmpty>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {data.items.map((item) => {
            const variant = item.values.join(" / ");
            return (
              <li key={item.id}>
                <Link
                  href={`/admin/inventory?inventorySearch=${encodeURIComponent(item.title)}`}
                  className="hover:bg-accent focus-visible:outline-focus flex items-center gap-3 rounded-lg px-2 py-2 text-sm outline-none focus-visible:outline-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.title}</span>
                    {variant && (
                      <span className="text-muted-foreground block truncate text-xs">
                        {variant}
                      </span>
                    )}
                  </span>
                  {/* red on the light red tint is 4.18:1, so empty rows take the outline badge (4.78:1) */}
                  <Badge
                    variant={item.quantity === 0 ? "outline" : "warning-light"}
                    radius="full"
                    className={cn(
                      "tabular-nums",
                      item.quantity === 0 && "text-destructive",
                    )}
                  >
                    {item.quantity} left
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function LowStockListSkeleton() {
  return <PanelSkeleton title="Low stock" rows={2} rowClassName="py-2" />;
}
