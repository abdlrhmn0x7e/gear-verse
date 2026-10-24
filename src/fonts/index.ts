import { Geist, JetBrains_Mono, Noto_Kufi_Arabic } from "next/font/google";

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const geist = Geist({ subsets: ["latin"] });

// The Arabic face. Only the arabic subset loads, so it never draws Latin text.
const notoKufi = Noto_Kufi_Arabic({ subsets: ["arabic"], display: "swap" });

// Geist first, then Noto Kufi Arabic for the Arabic glyphs Geist lacks, then Geist's metric-matched fallback. Both fallbacks
// are local Arial, which has Arabic glyphs, so neither may come before Noto Kufi Arabic, and its own fallback is left out.
const [geistFace, ...geistFallback] = geist.style.fontFamily.split(", ");
const [notoKufiFace] = notoKufi.style.fontFamily.split(", ");
export const fontSans = [geistFace, notoKufiFace, ...geistFallback].join(", ");
