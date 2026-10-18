import "~/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { TRPCReactProvider } from "~/trpc/client";
import { ThemeProvider } from "~/components/theme-provider";
import { ThemeColorScript, ThemeColorSync } from "~/components/theme-color";
import { Toaster } from "~/components/ui/toast";
import { TooltipProvider } from "~/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { jetBrainsMono } from "~/fonts";
import { env } from "~/env";
import { cn } from "~/lib/utils";
import { JsonLd } from "~/lib/seo/json-ld";
import { siteJsonLd } from "~/lib/seo/structured-data";
import { getStoreSettings } from "~/lib/store-settings";
import { Suspense } from "react";

import * as Sentry from "@sentry/nextjs";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
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
export const viewport: Viewport = {
  // the page runs under the notch and the home indicator; body keeps flow content inside the side and bottom insets,
  // and fixed bars pad themselves
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // globals.css scrolls smoothly; this lets Next jump instantly on navigation
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
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
          "flex min-h-screen flex-col pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] font-sans antialiased",
        )}
      >
        <Suspense fallback={null}>
          <SiteJsonLd />
        </Suspense>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeColorSync />
            <TRPCReactProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </TRPCReactProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}

/** The store's structured data, with its social profiles from the admin store settings. */
async function SiteJsonLd() {
  const settings = await getStoreSettings();
  return <JsonLd data={siteJsonLd(settings)} />;
}
