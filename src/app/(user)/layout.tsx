import { Navbar } from "~/components/navbar";

import { Footer } from "~/components/footer";
import { api, HydrateClient } from "~/trpc/server";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  void api.user.products.getPage.prefetch({
    pageSize: 10,
  });

  return (
    <HydrateClient>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </HydrateClient>
  );
}
