import { and, eq, gt, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/server/db";
import {
  brands,
  categories,
  inventoryItems,
  media,
  productOptions,
  productOptionValues,
  productOptionValuesVariants,
  products,
  productsMedia,
  productVariants,
  seo,
} from "~/server/db/schema";

export const _products = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      filters,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: {
        title?: string | null;
        brands?: string[] | null;
        categories?: string[] | null;
        price?: {
          min?: number | null;
          max?: number | null;
        };
      };
    }) => {
      console.log("product page filter", filters);
      const whereClause = [
        gt(products.id, cursor ?? 0),
        eq(products.published, true),
      ];
      if (filters?.title) {
        whereClause.push(ilike(products.title, `%${filters.title}%`));
      }
      if (filters?.brands) {
        whereClause.push(inArray(brands.slug, filters.brands));
      }
      if (filters?.categories) {
        const categoriesSlugs = new Set<string>([...filters.categories]);
        await Promise.all(
          filters.categories.map(async (categorySlug) => {
            const slugs =
              await _products.queries.helpers.getCategorySlugs(categorySlug);
            slugs.forEach((slug) => categoriesSlugs.add(slug));
          }),
        );

        whereClause.push(inArray(categories.slug, Array.from(categoriesSlugs)));
      }

      if (filters?.price?.min) {
        whereClause.push(gte(products.price, filters.price.min));
      }
      if (filters?.price?.max) {
        whereClause.push(lte(products.price, filters.price.max));
      }

      const brandsMedia = alias(media, "brands_media");

      const variantThumbnail = alias(media, "variant_thumbnail");
      const variantsQuery = db
        .select({
          productId: productVariants.productId,
          overridePrice: productVariants.overridePrice,
          thumbnailUrl: variantThumbnail.url,
          stock: inventoryItems.quantity,
          optionValues: sql<Record<string, string>>`
          jsonb_object_agg(
              ${productOptions.name}, ${productOptionValues.value}
            )
        `.as("option_values"),
        })
        .from(productVariants)
        .leftJoin(
          variantThumbnail,
          eq(productVariants.thumbnailMediaId, variantThumbnail.id),
        )
        .leftJoin(
          inventoryItems,
          eq(productVariants.id, inventoryItems.variantId),
        )
        .leftJoin(
          productOptionValuesVariants,
          eq(productOptionValuesVariants.productVariantId, productVariants.id),
        )
        .leftJoin(
          productOptionValues,
          eq(
            productOptionValuesVariants.productOptionValueId,
            productOptionValues.id,
          ),
        )
        .leftJoin(
          productOptions,
          eq(productOptionValues.productOptionId, productOptions.id),
        )
        .groupBy(
          productVariants.id,
          inventoryItems.quantity,
          variantThumbnail.id,
        )
        .as("product_variants");

      const variantsJson = db
        .select({
          productId: variantsQuery.productId,
          json: sql<
            {
              id: number;
              overridePrice: number;
              thumbnailUrl: string;
              stock: number;
              optionValues: Record<string, string>;
            }[]
          >`
          jsonb_agg(
            jsonb_build_object(
              'overridePrice', ${variantsQuery.overridePrice},
              'thumbnailUrl', ${variantsQuery.thumbnailUrl},
              'stock', ${variantsQuery.stock},
              'optionValues', ${variantsQuery.optionValues}
            )
          )
        `.as("json"),
        })
        .from(variantsQuery)
        .groupBy(variantsQuery.productId)
        .as("variants_json");

      return db
        .select({
          id: products.id,
          slug: products.slug,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: products.summary,
          thumbnailUrl: media.url,
          category: {
            name: categories.name,
            slug: categories.slug,
          },
          brand: {
            name: brands.name,
            logoUrl: brandsMedia.url,
          },
          variants: variantsJson.json,
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .leftJoin(variantsJson, eq(variantsJson.productId, products.id))
        .where(and(...whereClause, sql`${variantsJson.json} @@ '$.stock > 0'`))
        .limit(pageSize + 1)
        .orderBy(products.id);
    },

    findBySlug: async (slug: string) => {
      const nonArchivedOptionValues = db.$with("non_archived_option_values").as(
        db
          .selectDistinct({
            valueId: productOptionValues.id,
            value: productOptionValues.value,
            productOptionId: productOptionValues.productOptionId,
          })
          .from(productOptionValues)
          .innerJoin(
            productOptionValuesVariants,
            eq(
              productOptionValuesVariants.productOptionValueId,
              productOptionValues.id,
            ),
          )
          .innerJoin(
            productVariants,
            and(
              eq(
                productVariants.id,
                productOptionValuesVariants.productVariantId,
              ),
              eq(productVariants.archived, false),
            ),
          ),
      );

      const productOptionsJson = db
        .with(nonArchivedOptionValues)
        .select({
          productSlug: products.slug,
          options: sql<
            {
              id: number;
              name: string;
              values: { id: number; value: string }[];
            }[]
          >`
            jsonb_agg(
              jsonb_build_object(
                'id', ${productOptions.id},
                'name', ${productOptions.name},
                'values', coalesce(
                  (
                    select
                      jsonb_agg(jsonb_build_object('id', ${nonArchivedOptionValues.valueId}, 'value', ${nonArchivedOptionValues.value}))
                    from ${nonArchivedOptionValues}
                    where
                      "product_options"."id" = "product_option_id"
                  ),
                  '[]'::jsonb
                )
              )
            )
          `.as("options"), // the where clause had to be hard coded for some reason
          // the generated query was ambiguous. it was mixing the value id with the product option id
        })
        .from(productOptions)
        .leftJoin(products, eq(products.id, productOptions.productId))
        .groupBy(products.id)
        .as("product_options_json");

      const variantThumbnail = alias(media, "variant_thumbnail");
      const variantsQuery = db
        .select({
          id: productVariants.id,
          productSlug: products.slug,
          overridePrice: productVariants.overridePrice,
          thumbnailUrl: variantThumbnail.url,
          stock: inventoryItems.quantity,
          optionValues: sql<Record<string, string>>`
          jsonb_object_agg(
            ${productOptions.name}, ${productOptionValues.value}
          )
        `.as("option_values"),
        })
        .from(productVariants)
        .leftJoin(
          variantThumbnail,
          eq(productVariants.thumbnailMediaId, variantThumbnail.id),
        )
        .leftJoin(
          inventoryItems,
          eq(productVariants.id, inventoryItems.variantId),
        )
        .leftJoin(
          productOptionValuesVariants,
          eq(productOptionValuesVariants.productVariantId, productVariants.id),
        )
        .leftJoin(
          productOptionValues,
          eq(
            productOptionValuesVariants.productOptionValueId,
            productOptionValues.id,
          ),
        )
        .leftJoin(
          productOptions,
          eq(productOptionValues.productOptionId, productOptions.id),
        )
        .leftJoin(products, eq(products.id, productVariants.productId))
        .groupBy(
          products.slug,
          productVariants.id,
          inventoryItems.quantity,
          variantThumbnail.id,
        )
        .as("product_variants");

      const variantsJson = db
        .select({
          json: sql<
            {
              id: number;
              overridePrice: number;
              thumbnailUrl: string;
              stock: number;
              optionValues: Record<string, string>;
            }[]
          >`
          jsonb_agg(
            jsonb_build_object(
              'id', ${variantsQuery.id},
              'overridePrice', ${variantsQuery.overridePrice},
              'thumbnailUrl', ${variantsQuery.thumbnailUrl},
              'stock', ${variantsQuery.stock},
              'optionValues', ${variantsQuery.optionValues}
            )
          )
        `.as("json"),
        })
        .from(variantsQuery)
        .where(eq(variantsQuery.productSlug, slug))
        .as("variants_json");

      const productMediaQuery = db
        .select({
          mediaId: productsMedia.mediaId,
          url: media.url,
        })
        .from(productsMedia)
        .orderBy(productsMedia.order)
        .leftJoin(media, eq(productsMedia.mediaId, media.id))
        .leftJoin(products, eq(products.id, productsMedia.productId))
        .where(eq(products.slug, slug))
        .as("product_media_query");

      const productMediaJson = db
        .select({
          json: sql<string[]>`
            jsonb_agg(${productMediaQuery.url})
        `.as("product_media"),
        })
        .from(productMediaQuery)
        .as("product_media_json");

      const brandsMedia = alias(media, "brands_media");

      return db
        .select({
          id: products.id,
          title: products.title,
          price: products.price,
          strikeThroughPrice: products.strikeThroughPrice,
          summary: products.summary,
          description: products.description,
          published: products.published,
          categoryId: products.categoryId,
          brand: {
            name: brands.name,
            logoUrl: brandsMedia.url,
          },
          profit: products.profit,
          margin: products.margin,
          options: productOptionsJson.options,
          variants: variantsJson.json,
          media: productMediaJson.json,
          seo: {
            pageTitle: seo.pageTitle,
            urlHandler: seo.urlHandler,
            metaDescription: seo.metaDescription,
          },
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .leftJoin(
          productOptionsJson,
          eq(productOptionsJson.productSlug, products.slug),
        )
        .leftJoinLateral(variantsJson, sql`true`)
        .leftJoinLateral(productMediaJson, sql`true`)
        .leftJoin(seo, eq(seo.urlHandler, products.slug))
        .where(eq(products.slug, slug))
        .limit(1)
        .then(([product]) => product);
    },

    helpers: {
      async getCategorySlugs(categorySlug: string) {
        const childrenCategoriesIdsQuery = sql<{ slug: string }[]>`
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

              SELECT slug FROM all_children_categories
            `;

        return db
          .execute<{ slug: string }>(childrenCategoriesIdsQuery)
          .then((result) => result.map((row) => row.slug));
      },
    },
  },
};
