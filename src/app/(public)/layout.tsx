import { Navbar } from "~/components/navbar";

import { Footer } from "~/components/footer";
import { api, HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";
import { headers } from "next/headers";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  void api.public.products.getPage.prefetch({
    pageSize: 10,
  });
  void api.public.products.getPage.prefetch({
    pageSize: 6,
  });

  return (
    <HydrateClient>
      <Navbar user={data?.user ?? null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </HydrateClient>
  );
}
