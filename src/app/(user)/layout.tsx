import { Navbar } from "~/components/navbar";

import { Footer } from "~/components/footer";
import { api, HydrateClient } from "~/trpc/server";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  void api.admin.categories.findAll.prefetch();
  void api.admin.products.getPage.prefetch({ pageSize: 6 });

  return (
    <div>
      <HydrateClient>
        <Navbar />
        {children}
        <Footer />
      </HydrateClient>
    </div>
  );
}
