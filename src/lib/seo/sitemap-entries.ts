import { cacheTag } from "next/cache";
import { app } from "~/server/application";

/**
 * The indexable products and categories. "sitemap" is invalidated whenever a
 * product or category changes in a way that can move a page in or out:
 * publishing, archiving, stock and category edits.
 */
export async function findSitemapEntries() {
  "use cache";

  cacheTag("sitemap");

  return app.public.sitemap.queries.findEntries();
}
