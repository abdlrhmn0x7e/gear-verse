import "~/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";

import { TRPCReactProvider } from "~/trpc/client";
import { ThemeProvider } from "~/components/theme-provider";
import { ThemeColorScript, ThemeColorSync } from "~/components/theme-color";
import { Toaster } from "~/components/ui/toast";
import { TooltipProvider } from "~/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { fontSans, jetBrainsMono } from "~/fonts";
import { env } from "~/env";
import type { Locale } from "~/i18n/routing";
import { cn } from "~/lib/utils";
import { JsonLd } from "~/lib/seo/json-ld";
import { siteJsonLd } from "~/lib/seo/structured-data";
import { getStoreSettings } from "~/lib/store-settings";
import { Suspense } from "react";

import * as Sentry from "@sentry/nextjs";

/** The storefront's root layout localizes the title, description and Open Graph locale over this; the admin uses it as is. */
export const siteMetadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Gear Verse: Imported Gaming Gear in Egypt",
    template: "%s | Gear Verse",
  },
  description:
    "Hard-to-find gaming peripherals from international brands, hand-imported, customs cleared and delivered to your door anywhere in Egypt. Prices in EGP, cash on delivery.",
  applicationName: "Gear Verse",
  // the image comes from app/opengraph-image.png
  openGraph: {
    type: "website",
    siteName: "Gear Verse",
    locale: "en_EG",
  },
  twitter: {
    card: "summary_large_image",
  },
  // Next drops app/icon.png and app/apple-icon.png once `icons` is set, so
  // they are listed here next to the light and dark favicons
  icons: {
    icon: [
      {
        rel: "icon",
        media: "(prefers-color-scheme: dark)",
        url: "/favicon-dark.ico",
      },
      {
        rel: "icon",
        media: "(prefers-color-scheme: light)",
        url: "/favicon-light.ico",
      },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  other: {
    ...Sentry.getTraceData(),
  },
};

// No themeColor: it follows the site's theme rather than the phone's, so ThemeColorScript and ThemeColorSync own it
export const siteViewport: Viewport = {
  // the page runs under the notch and the home indicator; body keeps flow content inside the side and bottom insets,
  // and fixed bars pad themselves
  viewportFit: "cover",
};

/** The `<html>` document and app-wide providers, shared by the storefront's and the admin's root layouts. */
export function RootDocument({
  locale,
  admin = false,
  children,
}: {
  locale: Locale;
  /** The admin's own palette (`:root.admin` in globals.css), always dark. Its root layout is separate, so leaving it reloads the page and the class never reaches the storefront. */
  admin?: boolean;
  children: React.ReactNode;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      // globals.css scrolls smoothly; this lets Next jump instantly on navigation
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("font-sans", admin && "admin")}
      style={{ "--font-sans": fontSans } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- the rule reads this file as a pages/ document; it is an App Router root */}
      <head>
        <ThemeColorScript />
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        /> */}
      </head>

      <body
        className={cn(
          jetBrainsMono.variable,
          "flex min-h-dvh flex-col pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] font-sans antialiased max-lg:has-[[data-slot=buy-bar]]:pb-[calc(4.5rem+env(safe-area-inset-bottom))]",
        )}
      >
        <Suspense fallback={null}>
          <SiteJsonLd locale={locale} />
        </Suspense>
        <NextIntlClientProvider locale={locale}>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              // forced, so the admin never writes the storefront's saved theme
              forcedTheme={admin ? "dark" : undefined}
              disableTransitionOnChange
            >
              <ThemeColorSync />
              <TRPCReactProvider>
                {/* Base UI takes the direction from here, not from <html dir>, so the two change together */}
                <DirectionProvider direction={dir}>
                  <TooltipProvider>{children}</TooltipProvider>
                  <Toaster />
                </DirectionProvider>
              </TRPCReactProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/** The store's structured data, with its social profiles from the admin store settings. */
async function SiteJsonLd({ locale }: { locale: Locale }) {
  const settings = await getStoreSettings();
  return <JsonLd data={siteJsonLd(settings, locale)} />;
}
