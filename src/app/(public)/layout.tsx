import { Navbar } from "~/components/navbar";

import { Footer } from "~/components/footer";
import { HydrateClient } from "~/trpc/server";
import { VariantSelectionStoreProvider } from "../../stores/variant-selection/provider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HydrateClient>
      <VariantSelectionStoreProvider>
        <Navbar />

        <main className="flex-1">{children}</main>
        <Footer />
      </VariantSelectionStoreProvider>
    </HydrateClient>
  );
}
