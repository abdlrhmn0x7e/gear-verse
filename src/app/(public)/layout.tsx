import { Navbar } from "~/components/navbar/index";

import { Footer } from "~/components/footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="surface-control sr-only z-[60] rounded-full text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Navbar />
      {/* the fixed header grows by the top inset, so the page moves down with it */}
      <main id="main" className="flex-1 pt-[env(safe-area-inset-top)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
