import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const tanNimbus = localFont({
  src: "./tan-nimbus.woff2",
  display: "swap",
});
