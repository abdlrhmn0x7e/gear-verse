import { isDeepStrictEqual } from "node:util";

type Fields = Record<string, unknown>;

/**
 * `ar_reviewed` after a save, or undefined to leave it. Editing an Arabic field is a person writing it, so the Arabic
 * counts as reviewed (unless none is left); editing only the English sends the Arabic back to be checked again.
 * `next` holds just the fields this save sends; jsonb comes back with its keys reordered, hence the deep compare.
 */
export function arReviewedAfterSave({
  current,
  next,
  english,
  arabic,
}: {
  current: Fields;
  next: Fields;
  english: string[];
  arabic: string[];
}) {
  const changed = (key: string) =>
    next[key] !== undefined && !isDeepStrictEqual(next[key], current[key]);

  if (arabic.some(changed)) {
    return arabic.some(
      (key) => (next[key] === undefined ? current[key] : next[key]) != null,
    );
  }
  if (english.some(changed)) return false;
  return undefined;
}
