import { Navbar } from "~/components/navbar";

import { Footer } from "~/components/footer";
import { HydrateClient } from "~/trpc/server";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HydrateClient>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </HydrateClient>
  );
}
