import type { Metadata } from "next";
import { Suspense } from "react";

import {
  RootDocument,
  siteMetadata,
  siteViewport,
} from "~/components/root-document";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  ...siteMetadata,
  robots: { index: false, follow: false },
};

export const viewport = siteViewport;

/** A root layout of its own: the admin is English only, outside the storefront's [locale] segment. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootDocument locale="en" admin>
      <Suspense>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </RootDocument>
  );
}
