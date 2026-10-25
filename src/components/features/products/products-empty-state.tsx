"use client";

import {
  ArrowRightIcon,
  FunnelXIcon,
  MessageSquarePlusIcon,
  PackageSearchIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";

/** Every listing ends in a way forward: clear what narrowed it, request what isn't stocked, or go to the full store. */
export function ProductsEmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  const t = useTranslations("products");
  return (
    <div className="bg-card flex flex-col items-center gap-6 rounded-3xl px-6 py-20 text-center">
      <PackageSearchIcon
        className="text-muted-foreground size-10"
        strokeWidth={1.5}
        aria-hidden
      />
      <div className="max-w-sm space-y-2">
        <h2 className="text-title text-balance">
          {hasFilters ? t("empty.filteredTitle") : t("empty.emptyTitle")}
        </h2>
        <p className="text-muted-foreground text-pretty">
          {hasFilters ? t("empty.filteredBody") : t("empty.emptyBody")}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasFilters ? (
          <Button onClick={onClearFilters}>
            <FunnelXIcon data-icon="inline-start" />
            {t("filters.clear")}
          </Button>
        ) : (
          // a route that opens WhatsApp with the request typed, so a plain link and a new tab
          <Button
            nativeButton={false}
            render={<a href="/request" target="_blank" rel="noopener" />}
          >
            <MessageSquarePlusIcon data-icon="inline-start" />
            {t("empty.requestItem")}
          </Button>
        )}
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          {t("empty.browseAll")}
          <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
        </Button>
      </div>
    </div>
  );
}
