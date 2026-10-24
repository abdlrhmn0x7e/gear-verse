import { Geist, JetBrains_Mono, Readex_Pro } from "next/font/google";

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const geist = Geist({ subsets: ["latin"] });

// The Arabic face. Only the arabic subset loads, so it never draws Latin text.
const readexPro = Readex_Pro({ subsets: ["arabic"], display: "swap" });

// Geist first, then Readex Pro for the Arabic glyphs Geist lacks, then Geist's metric-matched fallback. Both fallbacks
// are local Arial, which has Arabic glyphs, so neither may come before Readex Pro, and Readex Pro's own is left out.
const [geistFace, ...geistFallback] = geist.style.fontFamily.split(", ");
const [readexProFace] = readexPro.style.fontFamily.split(", ");
export const fontSans = [geistFace, readexProFace, ...geistFallback].join(", ");
