import { ShoppingBagIcon } from "lucide-react";
import PageHeader from "../../_components/page-header";
import { AddListingDrawer } from "./_components/add-listing-drawer";
import { ListingsTable } from "../../_components/tables/listing/table";
import { HydrateClient } from "~/trpc/server";
import { api } from "~/trpc/server";
import { loadListingSearchParams } from "../../_components/tables/listing/hooks";
import type { SearchParams } from "nuqs/server";
import { ListingDrawer } from "./_components/listing-drawer";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await loadListingSearchParams(searchParams);
  if (params.listingId) {
    void api.listing.queries.findById.prefetch({
      id: params.listingId,
    });
  }
  void api.listing.queries.getPage.prefetch({
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <PageHeader
          title="Listings"
          description="Manage your listings and start selling some shit you fat ass ugh..."
          Icon={ShoppingBagIcon}
        />

        <AddListingDrawer />
      </div>

      <HydrateClient>
        <ListingsTable />
        <ListingDrawer />
      </HydrateClient>
    </section>
  );
}
