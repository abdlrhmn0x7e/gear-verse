import { ShoppingBagIcon } from "lucide-react";
import PageHeader from "../../_components/page-header";
import { AddListingDrawer } from "./_components/add-listing-drawer";

export default function ListingsPage() {
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
    </section>
  );
}
