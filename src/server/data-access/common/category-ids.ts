import { sql } from "drizzle-orm";
import { db } from "~/server/db";

/** The ids of a category and of every category nested under it. */
export async function getCategoryIdsBySlug(categorySlug: string) {
  const childrenCategoriesIdsQuery = sql`
    WITH RECURSIVE all_children_categories AS (
      SELECT categories.id, categories.slug
      FROM categories
      WHERE slug = ${categorySlug}

      UNION ALL

      SELECT categories.id, categories.slug
      FROM categories
      INNER JOIN all_children_categories
        ON all_children_categories.id = categories.parent_id
    )

    SELECT id FROM all_children_categories
  `;

  return db
    .execute<{ id: number }>(childrenCategoriesIdsQuery)
    .then((result) => result.map((row) => row.id));
}
