import {
  isNull,
  sql,
  eq,
  gt,
  or,
  count,
  and,
  desc,
  inArray,
  gte,
  lte,
  asc,
} from "drizzle-orm";
import type { CategoryTree } from "~/lib/schemas/entities/category";
import { db } from "~/server/db";
import {
  brands,
  categories,
  inventoryItems,
  media,
  products,
} from "~/server/db/schema";
import {
  attributes,
  attributeValues,
  categoryAttributes,
} from "~/server/db/schema/attributes";
import type { Pagination } from "../common/types";
import type { CategoryProductsFilters } from "~/lib/schemas/contracts/public/categories";
import { variantsCTE } from "../common/cte";
import { alias } from "drizzle-orm/pg-core";

export const _categories = {
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

    async findAllSlugs() {
      return db
        .select({
          slug: categories.slug,
        })
        .from(categories)
        .where(isNull(categories.parent_id));
    },

    async getRoots() {
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
    },

    getProductsPage: async ({
      cursor,
      pageSize,
      filters,
      slug,
      sortBy,
    }: Pagination & { filters?: CategoryProductsFilters; slug: string }) => {
      const brandsMedia = alias(media, "brands_media");

      // this might need future refactoring I don't think this query is as optimal as it could be
      const fragments =
        filters?.attributes.map(
          _categories.queries.helpers.existsFragmentForFilter,
        ) ?? [];
      const categoryIds =
        await _categories.queries.helpers.getCategoryIdsBySlug(slug);

      const preds = [
        gt(products.id, cursor ?? 0),
        eq(products.published, true),
        inArray(categories.id, categoryIds),
        ...fragments,
      ];

      const availabilityPredicate = sql`(
        coalesce(${inventoryItems.quantity}, 0) > 0
        OR
        coalesce((${variantsCTE.json} @@ '$.stock > 0'), false)
      )`;

      if (filters?.brands) {
        preds.push(inArray(brands.slug, filters.brands));
      }

      if (filters?.price?.min) {
        preds.push(gte(products.price, filters.price.min));
      }
      if (filters?.price?.max) {
        preds.push(lte(products.price, filters.price.max));
      }

      // Default order by is newest (desc)
      let orderByClause = desc(products.id);
      switch (sortBy) {
        case "price-asc":
          orderByClause = asc(products.price);
          break;
        case "price-desc":
          orderByClause = desc(products.price);
          break;
        case "newest":
          orderByClause = desc(products.id);
          break;
        case "oldest":
          orderByClause = asc(products.id);
          break;
      }

      return db
        .with(variantsCTE)
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: products.summary,
          thumbnailUrl: media.url,
          stock: inventoryItems.quantity,
          category: {
            name: categories.name,
            slug: categories.slug,
          },
          brand: {
            name: brands.name,
            logoUrl: brandsMedia.url,
          },
          variants: variantsCTE.json,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(
          inventoryItems,
          and(
            eq(inventoryItems.productId, products.id),
            isNull(inventoryItems.productVariantId),
          ),
        )
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .leftJoin(variantsCTE, eq(variantsCTE.productId, products.id))
        .where(and(availabilityPredicate, ...preds))
        .orderBy(orderByClause)
        .limit(pageSize + 1);
    },

    async getAttributes(slug: string) {
      type Value = {
        id: number;
        value: string;
        slug: string;
      };
      const attributeValuesCTE = db.$with("attribute_values_cte").as(
        db
          .select({
            attributeId: attributes.id,
            attributeType: attributes.type,
            values: sql<Value[]>`
              coalesce(
                jsonb_agg(
                  jsonb_build_object(
                    'id', ${attributeValues.id},
                    'value', ${attributeValues.value},
                    'slug', ${attributeValues.slug}
                  ) order by ${attributeValues.id}
                ) filter (where ${attributeValues.id} is not null),
                '[]'::jsonb
              )
            `.as("attribute_values_json"),
          })
          .from(attributes)
          .leftJoin(
            attributeValues,
            eq(attributes.id, attributeValues.attributeId),
          )
          .groupBy(attributes.id, attributes.type)
          .having(
            or(
              eq(attributes.type, "BOOLEAN"),
              gt(count(attributeValues.id), 0),
            ),
          ),
      );

      return db
        .with(attributeValuesCTE)
        .select({
          name: attributes.name,
          slug: attributes.slug,
          type: attributes.type,
          values: attributeValuesCTE.values,
        })
        .from(attributes)
        .rightJoin(
          attributeValuesCTE,
          eq(attributes.id, attributeValuesCTE.attributeId),
        )
        .leftJoin(
          categoryAttributes,
          eq(attributes.id, categoryAttributes.attributeId),
        )
        .leftJoin(categories, eq(categoryAttributes.categoryId, categories.id))
        .where(eq(categories.slug, slug));
    },

    helpers: {
      async getCategoryIdsBySlug(categorySlug: string) {
        const childrenCategoriesIdsQuery = sql<{ id: string }[]>`
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
      },

      existsFragmentForFilter: (
        filter: CategoryProductsFilters["attributes"][number],
      ) => {
        // extract type & attr
        const [kind, attr] = filter.type.split(".", 2);

        if (kind === "multi") {
          const vals = filter.value as string[];

          // build the array manually cause drizzle is spreading it
          const valsSqlElements = vals.map((v) => sql`${v}`); // each becomes its own param
          const valsArraySql = sql`ARRAY[${sql.join(valsSqlElements, sql`, `)}]::text[]`;

          return sql`EXISTS (
            SELECT 1
            FROM product_attribute_values pav
            JOIN attribute_values av ON av.id = pav.attribute_value_id
            JOIN attributes a ON a.id = av.attribute_id
            WHERE pav.product_id = products.id
              AND a.slug = ${attr}
              AND av.slug = ANY(${valsArraySql})
          )`;
        }

        if (kind === "select") {
          const val = filter.value as string;
          return sql`EXISTS (
            SELECT 1
            FROM product_attribute_values pav
            JOIN attribute_values av ON av.id = pav.attribute_value_id
            JOIN attributes a ON a.id = av.attribute_id
            WHERE pav.product_id = products.id
              AND a.slug = ${attr}
              AND av.slug = ${val}
          )`;
        }

        if (kind === "bool") {
          const boolVal = filter.value as boolean;

          // we store booleans as 'true'/'false' in attribute_values.slug
          const slug = boolVal ? "true" : "false";
          return sql`EXISTS (
            SELECT 1
            FROM product_attribute_values pav
            JOIN attribute_values av ON av.id = pav.attribute_value_id
            JOIN attributes a ON a.id = av.attribute_id
            WHERE pav.product_id = products.id
              AND a.slug = ${attr}
              AND av.slug = ${slug}
          )`;
        }

        throw new Error("unsupported filter kind");
      },
    },
  },
};
