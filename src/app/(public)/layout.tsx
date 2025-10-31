import { Navbar } from "~/components/navbar/index";

import { Footer } from "~/components/footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
