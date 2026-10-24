import type { JSONContent } from "@tiptap/react";

export const arabicStatuses = ["missing", "draft", "reviewed"] as const;
export type ArabicStatus = (typeof arabicStatuses)[number];

/**
 * Missing until any Arabic field is set, then Draft until a person has checked it against the English. `arabic` holds
 * each Arabic field, or a flag for whether one is set; the server saves an emptied field as null.
 */
export function arabicStatus(
  arabic: unknown[],
  reviewed: boolean,
): ArabicStatus {
  if (!arabic.some((value) => value != null && value !== false)) {
    return "missing";
  }
  return reviewed ? "reviewed" : "draft";
}

/** Whether a description holds any text or image; an editor cleared to one empty paragraph doesn't. */
export function hasContent(doc: JSONContent | null | undefined): boolean {
  if (!doc) return false;
  if (doc.text?.trim() || doc.type === "image") return true;
  return doc.content?.some(hasContent) ?? false;
}

/**
 * On the Arabic site, marks catalog copy still in English as English, so screen readers and the bidi algorithm treat
 * it as English, and pins Arabic copy right to left: drafts keep Latin terms, and dir="auto" would read
 * "Rapid Trigger لحد 0.005mm" as left to right. English pages get nothing.
 */
export function localizedCopyProps(
  locale: string,
  isFallback: boolean | undefined,
) {
  if (locale !== "ar") return {};
  return isFallback
    ? ({ lang: "en", dir: "ltr" } as const)
    : ({ dir: "rtl" } as const);
}
