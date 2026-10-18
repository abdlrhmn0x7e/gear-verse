import type { Metadata } from "next";

// checkout and orders are per customer, so they stay out of search results
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
