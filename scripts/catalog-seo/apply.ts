/**
 * Sets the English page titles in titles.json; the page adds " | Gear Verse". Dry run by default;
 * `bun scripts/catalog-seo/apply.ts --write` writes.
 *
 * url_handler is set to the slug because the storefront used to find the SEO row by it. A meta description that
 * repeats a price is cleared, so the page's default (which reads the live price) applies. Running it twice changes
 * nothing the second time.
 */
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { env } from "~/env";
import { db } from "~/server/db";
import { products, seo } from "~/server/db/schema";
import titles from "./titles.json";

const write = process.argv.includes("--write");
const target = new URL(env.DATABASE_URL);
console.log(
  `${write ? "Writing to" : "Dry run against"} ${target.host}${target.pathname}\n`,
);

// the " | Gear Verse" template brings a title to Google's ~60 characters at most
for (const { slug, pageTitle } of titles) {
  assert(pageTitle.length + 13 <= 60, `${slug}: title too long`);
}

await db.transaction(async (tx) => {
  for (const draft of titles) {
    const [row] = await tx
      .select({ slug: products.slug, seo })
      .from(products)
      .leftJoin(seo, eq(seo.productId, products.id))
      .where(eq(products.id, draft.id));

    if (row?.slug !== draft.slug) {
      console.log(`skipped   #${draft.id} ${draft.slug}: slug changed or gone`);
      continue;
    }

    const values = {
      pageTitle: draft.pageTitle,
      urlHandler: draft.slug,
      metaDescription: /\d\s*EGP/.test(row.seo?.metaDescription ?? "")
        ? null
        : (row.seo?.metaDescription ?? null),
    };
    const current = row.seo && {
      pageTitle: row.seo.pageTitle,
      urlHandler: row.seo.urlHandler,
      metaDescription: row.seo.metaDescription,
    };
    if (JSON.stringify(current) === JSON.stringify(values)) {
      console.log(`unchanged #${draft.id} ${draft.slug}`);
      continue;
    }

    if (write) {
      await tx
        .insert(seo)
        .values({ ...values, productId: draft.id })
        .onConflictDoUpdate({ target: seo.productId, set: values });
    }
    console.log(
      `${write ? "set" : "would set"} #${draft.id}: "${current?.pageTitle ?? "(default)"}" -> "${values.pageTitle}"${current?.metaDescription && !values.metaDescription ? " (meta description cleared)" : ""}`,
    );
  }
});

if (!write) console.log("\nDry run: nothing written. Add --write to apply.");
process.exit(0);
