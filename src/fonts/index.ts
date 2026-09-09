import { JetBrains_Mono, Nunito_Sans } from "next/font/google";
import localFont from "next/font/local";

export const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito-sans",
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const tanNimbus = localFont({
  src: "./tan-nimbus.woff2",
  display: "swap",
});
