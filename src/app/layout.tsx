import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Gear Verse",
  description: "Gear Verse",
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

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const tanNimbus = localFont({
  src: "../../public/fonts/tan-nimbus.woff2",
  variable: "--font-serif",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${tanNimbus.variable}`}
      suppressHydrationWarning
    >
      <body>
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
