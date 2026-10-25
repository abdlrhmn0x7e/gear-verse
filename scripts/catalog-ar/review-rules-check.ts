/**
 * Checks the Arabic status and the review rules the admin saves apply. No database needed:
 * `bun scripts/catalog-ar/review-rules-check.ts`.
 */
import assert from "node:assert/strict";
import { arabicStatus, hasContent } from "~/lib/arabic";
import { arReviewedAfterSave } from "~/server/application/helpers/arabic-review";

assert.equal(arabicStatus([null, null], true), "missing");
assert.equal(arabicStatus([false], false), "missing");
assert.equal(arabicStatus(["ملخص", null], false), "draft");
assert.equal(arabicStatus([true], true), "reviewed");

assert.equal(
  hasContent({ type: "doc", content: [{ type: "paragraph" }] }),
  false,
);
assert.equal(hasContent({}), false);
assert.equal(
  hasContent({
    type: "doc",
    content: [{ type: "image", attrs: { src: "a.png" } }],
  }),
  true,
);

const copy = {
  english: ["summary", "description"],
  arabic: ["summaryAr", "descriptionAr"],
};
const doc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }],
};
const current = {
  summary: "Fast",
  description: doc,
  summaryAr: "سريع",
  descriptionAr: null,
};

// an Arabic edit is a person writing it
assert.equal(
  arReviewedAfterSave({ current, next: { summaryAr: "سريع جدًا" }, ...copy }),
  true,
);
// an English edit alone sends the Arabic back for a check
assert.equal(
  arReviewedAfterSave({ current, next: { summary: "Faster" }, ...copy }),
  false,
);
// both at once: the person saw the English while writing the Arabic
assert.equal(
  arReviewedAfterSave({
    current,
    next: { summary: "Faster", summaryAr: "أسرع" },
    ...copy,
  }),
  true,
);
// clearing the last Arabic leaves nothing to call reviewed
assert.equal(
  arReviewedAfterSave({ current, next: { summaryAr: null }, ...copy }),
  false,
);
// the same description with its keys in another order (jsonb reorders them) is no change
assert.equal(
  arReviewedAfterSave({
    current,
    next: { description: { content: doc.content, type: "doc" }, title: "New" },
    ...copy,
  }),
  undefined,
);
// a new item with Arabic counts as reviewed, without it stays unreviewed
assert.equal(
  arReviewedAfterSave({ current: {}, next: { summaryAr: "سريع" }, ...copy }),
  true,
);
assert.equal(
  arReviewedAfterSave({ current: {}, next: { summary: "Fast" }, ...copy }),
  false,
);

console.log("Arabic review rules hold.");
