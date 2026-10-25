import { hasLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { use } from "react";
import { Navbar } from "~/components/navbar/index";

import { Footer } from "~/components/footer";
import { SmoothScroll } from "~/components/smooth-scroll";
import { routing } from "~/i18n/routing";

export default function UserLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // the [locale] segment matches any first segment the proxy doesn't rewrite, such as /missing.txt
  if (!hasLocale(routing.locales, use(params).locale)) {
    notFound();
  }
  const t = useTranslations("common");

  return (
    <SmoothScroll>
      <a
        href="#main"
        className="surface-control sr-only z-[60] rounded-full text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:px-4 focus:py-2"
      >
        {t("skipToContent")}
      </a>
      <Navbar />
      {/* the fixed header grows by the top inset, so the page moves down with it */}
      <main id="main" className="flex-1 pt-[env(safe-area-inset-top)]">
        {children}
      </main>
      <Footer />
    </SmoothScroll>
  );
}
