import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const tanNimbus = localFont({
  src: "./tan-nimbus.woff2",
  display: "swap",
});
