import "~/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { TRPCReactProvider } from "~/trpc/client";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { jetBrainsMono } from "~/fonts";
import { env } from "~/env";
import { cn } from "~/lib/utils";

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

// --background in globals.css (neutral-50 and neutral-900) as hex
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#1b151b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      {/* <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head> */}

      <body
        className={cn(
          jetBrainsMono.variable,
          "flex min-h-screen flex-col font-sans antialiased",
        )}
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster richColors />
            </TRPCReactProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
