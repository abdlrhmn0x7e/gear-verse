import { ShoppingBagIcon } from "lucide-react";
import Header from "../../../../components/header";
import { AddListingDrawer } from "../../_components/drawers/add-listing-drawer";
import { ListingsTable } from "../../_components/tables/listing/table";
import { HydrateClient } from "~/trpc/server";
import { api } from "~/trpc/server";
import { loadListingSearchParams } from "../../_hooks/use-listing-search-params";
import type { SearchParams } from "nuqs/server";
import { ListingDrawer } from "../../_components/drawers/listing-drawer";
import { EditListingDrawer } from "../../_components/drawers/edit-listing-drawer";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await loadListingSearchParams(searchParams);
  if (params.listingId) {
    void api.listing.findFullById.prefetch({
      id: params.listingId,
    });
  }
  void api.listing.getPage.prefetch({
    pageSize: 10,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Header
          title="Listings"
          description="Manage your listings and start selling some shit you fat ass ugh..."
          Icon={ShoppingBagIcon}
        />

        <AddListingDrawer />
      </div>

      <HydrateClient>
        <ListingsTable />
        <ListingDrawer />
        <EditListingDrawer />
      </HydrateClient>
    </section>
  );
}
