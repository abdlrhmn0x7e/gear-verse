import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Gear Verse",
  description: "Gear Verse",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
    <html lang="en" className={`${geist.variable} ${tanNimbus.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
