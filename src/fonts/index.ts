import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const tanNimbus = localFont({
  src: "./tan-nimbus.woff2",
  display: "swap",
});
