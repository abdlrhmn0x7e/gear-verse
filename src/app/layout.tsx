import "~/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { instrumentSans } from "~/fonts";
import { env } from "~/env";
import { cn } from "~/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Gear Verse",
  description:
    "Hard-to-find gaming peripherals and accessories from international brands — hand-imported, customs cleared, and delivered to your door.",
  openGraph: {
    images: [
      {
        url: "/images/gear-light.png",
      },
    ],
  },
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
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head> */}
      <body
        className={cn(instrumentSans.className, "flex min-h-screen flex-col")}
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              {children}
              <Toaster richColors />
            </TRPCReactProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
