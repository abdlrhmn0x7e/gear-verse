import { isNull, sql } from "drizzle-orm";
import type { CategoryTree } from "~/lib/schemas/category";
import { db } from "~/server/db";
import { categories } from "~/server/db/schema";

export const _userCategoriesRepo = {
  queries: {
    async findAll({
      filters,
    }: {
      filters?: Partial<{
        root: boolean;
      }>;
    } = {}) {
      if (filters?.root) {
        return db
          .select({
            id: categories.id,
            name: categories.name,
            icon: categories.icon,
            slug: categories.slug,
            created_at: categories.created_at,
          })
          .from(categories)
          .where(isNull(categories.parent_id));
      }

      const query = sql<{ tree: string }[]>`
        WITH RECURSIVE all_categories AS (
          SELECT categories.*, 0 AS level
          FROM categories
          WHERE parent_id IS NULL

          UNION ALL

          SELECT categories.*, all_categories.level + 1
          FROM categories
          INNER JOIN all_categories
            ON all_categories.id = categories.parent_id
        ),

        all_categories_agg AS (
          SELECT
            all_categories.*,
            'null'::jsonb AS children -- leaf nodes has null childrens
          FROM all_categories
          WHERE
            level = (SELECT max(level) FROM all_categories) -- get leaf nodes

          UNION ALL -- Use UNION ALL for recursive CTEs

          SELECT
            (branch_parent).*, -- Select all columns from the branch_parent row
            jsonb_strip_nulls(
              jsonb_agg(
                branch_child - 'parent_id' - 'level'
                ORDER BY
                  branch_child->>'name'
              ) FILTER (
                WHERE
                  branch_child->>'parent_id' = (branch_parent).id::text
              )
            ) AS children -- Alias the aggregated column as 'children'
          FROM (
            SELECT
              branch_parent, -- Pass the entire branch_parent row as a single composite type
              to_jsonb(branch_child) AS branch_child
            FROM all_categories AS branch_parent -- Use AS for clarity
            INNER JOIN all_categories_agg AS branch_child
              ON branch_child.level = branch_parent.level + 1
          ) AS branch_join_results -- Give the derived table an alias
          GROUP BY
            branch_parent -- Group by the entire composite type (the parent row)
        )
        SELECT
          jsonb_pretty(jsonb_agg(to_jsonb(all_categories_agg) - 'parent_id' - 'level')) AS tree
        FROM all_categories_agg
        WHERE
          level = 0;
      `;

      // fuck the ORM, use raw SQL
      const result = (await db.execute(query))[0]!.tree as string;
      return JSON.parse(result ?? "[]") as CategoryTree[]; // this is validated on the router level
    },
  },
};
