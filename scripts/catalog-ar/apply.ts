/**
 * Fills the Arabic drafts in drafts.json into the categories and products that have no Arabic yet. Dry run by default;
 * `bun scripts/catalog-ar/apply.ts --write` writes.
 *
 * It only fills Arabic fields that are NULL, so a person's edit is never overwritten, and it leaves the filled items
 * unreviewed. An item whose English changed since the drafts were written is skipped: its draft translates old copy.
 * Running it twice changes nothing the second time.
 */
import type { JSONContent } from "@tiptap/react";
import { and, eq, sql } from "drizzle-orm";
import { isDeepStrictEqual } from "node:util";
import { env } from "~/env";
import { db } from "~/server/db";
import { categories, products } from "~/server/db/schema";
import drafts from "./drafts.json";

type Draft<English, Arabic> = {
  id: number;
  slug: string;
  english: English;
  arabic: Arabic;
};

const write = process.argv.includes("--write");
const target = new URL(env.DATABASE_URL);
console.log(
  `${write ? "Writing to" : "Dry run against"} ${target.host}${target.pathname}\n`,
);

type Outcome = "filled" | "unchanged" | "skipped";
const tally = {
  categories: { filled: 0, unchanged: 0, skipped: 0 },
  products: { filled: 0, unchanged: 0, skipped: 0 },
};

function report(
  table: keyof typeof tally,
  item: { id: number; slug: string },
  outcome: Outcome,
  detail: string,
) {
  tally[table][outcome] += 1;
  console.log(
    `${outcome.padEnd(9)} ${table} #${item.id} ${item.slug}: ${detail}`,
  );
}

await db.transaction(async (tx) => {
  for (const draft of drafts.categories as Draft<
    { name: string; description: string | null },
    { name: string; description: string | null }
  >[]) {
    const [row] = await tx
      .select({
        name: categories.name,
        description: categories.description,
        name_ar: categories.name_ar,
        description_ar: categories.description_ar,
      })
      .from(categories)
      .where(eq(categories.id, draft.id));

    if (!row) {
      report("categories", draft, "skipped", "no longer exists");
      continue;
    }
    if (
      row.name !== draft.english.name ||
      row.description !== draft.english.description
    ) {
      report("categories", draft, "skipped", "English changed since drafting");
      continue;
    }

    const fill = {
      ...(row.name_ar === null && { name_ar: draft.arabic.name }),
      ...(row.description_ar === null &&
        draft.arabic.description !== null && {
          description_ar: draft.arabic.description,
        }),
    };
    if (Object.keys(fill).length === 0) {
      report("categories", draft, "unchanged", "Arabic already set");
      continue;
    }

    report("categories", draft, "filled", Object.keys(fill).join(", "));
    if (write) {
      // coalesce, so an edit made since the read above still wins
      await tx
        .update(categories)
        .set({
          name_ar: sql`coalesce(${categories.name_ar}, ${fill.name_ar ?? null})`,
          description_ar: sql`coalesce(${categories.description_ar}, ${fill.description_ar ?? null})`,
          ar_reviewed: false,
        })
        .where(
          and(
            eq(categories.id, draft.id),
            eq(categories.name, draft.english.name),
          ),
        );
    }
  }

  for (const draft of drafts.products as Draft<
    { summary: string; description: JSONContent },
    { summary: string; description: JSONContent }
  >[]) {
    const [row] = await tx
      .select({
        summary: products.summary,
        description: products.description,
        summaryAr: products.summaryAr,
        descriptionAr: products.descriptionAr,
      })
      .from(products)
      .where(eq(products.id, draft.id));

    if (!row) {
      report("products", draft, "skipped", "no longer exists");
      continue;
    }
    // jsonb returns its keys reordered, so compare the content, not the text
    if (
      row.summary !== draft.english.summary ||
      !isDeepStrictEqual(row.description, draft.english.description)
    ) {
      report("products", draft, "skipped", "English changed since drafting");
      continue;
    }

    const fill = {
      ...(row.summaryAr === null && { summaryAr: draft.arabic.summary }),
      ...(row.descriptionAr === null && {
        descriptionAr: draft.arabic.description,
      }),
    };
    if (Object.keys(fill).length === 0) {
      report("products", draft, "unchanged", "Arabic already set");
      continue;
    }

    report("products", draft, "filled", Object.keys(fill).join(", "));
    if (write) {
      // coalesce and the English check again, so an edit made since the read above still wins
      await tx
        .update(products)
        .set({
          summaryAr: sql`coalesce(${products.summaryAr}, ${fill.summaryAr ?? null})`,
          descriptionAr: sql`coalesce(${products.descriptionAr}, ${fill.descriptionAr ? JSON.stringify(fill.descriptionAr) : null}::jsonb)`,
          arReviewed: false,
        })
        .where(
          and(
            eq(products.id, draft.id),
            eq(products.summary, draft.english.summary),
            sql`${products.description} = ${JSON.stringify(draft.english.description)}::jsonb`,
          ),
        );
    }
  }
});

console.log(
  `\nCategories: ${tally.categories.filled} filled, ${tally.categories.unchanged} unchanged, ${tally.categories.skipped} skipped`,
);
console.log(
  `Products: ${tally.products.filled} filled, ${tally.products.unchanged} unchanged, ${tally.products.skipped} skipped`,
);
if (!write) console.log("\nDry run: nothing written. Add --write to apply.");
process.exit(0);
