import { and, asc, between, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "~/server/db";
import {
  brands,
  media,
  products,
  productVariants,
  users,
} from "~/server/db/schema";
import { reviews } from "~/server/db/schema/reviews";

export const _products = {
  queries: {
    getPage: async ({
      cursor,
      pageSize,
      filters,
      sortBy,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: Partial<{
        categories: number[];
        brands: number[];
        price: {
          min: number;
          max: number;
        };
      }>;
      sortBy?: "newest" | "oldest" | "price-asc" | "price-desc";
    }) => {
      const brandsMedia = alias(media, "brands_media");
      const variantsMedia = alias(media, "variants_media");
      const cheapestVariant = db
        .select({ price: variants.price })
        .from(variants)
        .where(eq(variants.productId, products.id))
        .orderBy(asc(variants.price))
        .limit(1)
        .as("cheapest_variant");

      const productVariantsJson = db
        .select({
          variants: sql<{ name: string; thumbnail: string }[]>`
            json_agg(json_build_object(
              'name', product_variants.name,
              'thumbnail', variants_media.url
            ))
          `.as("variants"),
        })
        .from(variants)
        .where(eq(variants.productId, products.id))
        .leftJoin(
          variantsMedia,
          eq(variants.thumbnailMediaId, variantsMedia.id),
        )
        .as("product_variants_json");

      const productReviewsJson = db
        .select({
          reviews: sql<
            {
              rating: number;
              comment: string;
              createdAt: Date;
              user: { name: string; image: string };
            }[]
          >`
            json_agg(
              json_build_object(
                'rating', reviews.rating,
                'comment', reviews.comment,
                'createdAt', reviews.created_at,
                'user', json_build_object(
                  'name', users.name,
                  'image', users.image
                )
              )
            )
          `.as("reviews"),
        })
        .from(reviews)
        .where(eq(reviews.productId, products.id))
        .leftJoin(users, eq(reviews.userId, users.id))
        .as("product_reviews_json");

      const inStock = db
        .select({
          value: sql`
            bool_or(product_variants.stock > 0)
          `.as("in_stock"),
        })
        .from(variants)
        .where(eq(variants.productId, products.id))
        .groupBy(variants.productId)
        .limit(1)
        .as("in_stock");

      const whereClause = [
        gt(products.id, cursor ?? 0),
        eq(products.published, true),
      ];
      if (filters?.categories) {
        const categoriesIds = new Set<number>([...filters.categories]);
        await Promise.all(
          filters.categories.map((categoryId) => {
            const childrenCategoriesIdsQuery = sql<{ id: number }[]>`
            WITH RECURSIVE all_children_categories AS (
              SELECT id 
              FROM categories
              WHERE parent_id = ${categoryId}

              UNION ALL

              SELECT categories.id
              FROM categories
              INNER JOIN all_children_categories
                ON all_children_categories.id = categories.parent_id
            )

            SELECT id FROM all_children_categories
          `;

            return db
              .execute<{ id: number }>(childrenCategoriesIdsQuery)
              .then((result) =>
                result.forEach((row) => {
                  categoriesIds.add(row.id);
                }),
              );
          }),
        );

        whereClause.push(
          inArray(products.categoryId, Array.from(categoriesIds)),
        );
      }
      if (filters?.brands) {
        whereClause.push(inArray(products.brandId, filters.brands));
      }
      if (filters?.price) {
        whereClause.push(
          between(cheapestVariant.price, filters.price.min, filters.price.max),
        );
      }

      let sortByClause = desc(products.id);
      switch (sortBy) {
        case "newest":
          sortByClause = desc(products.createdAt);
          break;
        case "oldest":
          sortByClause = asc(products.createdAt);
          break;
        case "price-asc":
          sortByClause = asc(cheapestVariant.price);
          break;
        case "price-desc":
          sortByClause = desc(cheapestVariant.price);
          break;
      }

      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: cheapestVariant.price,
          summary: products.summary,
          thumbnail: media.url,
          brand: {
            id: brands.id,
            name: brands.name,
            logo: brandsMedia.url,
          },
          reviews: productReviewsJson.reviews,
          variants: productVariantsJson.variants,
          inStock: inStock.value,
        })
        .from(products)
        .where(and(...whereClause))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .leftJoinLateral(cheapestVariant, sql`true`)
        .leftJoinLateral(inStock, sql`true`)
        .leftJoinLateral(productVariantsJson, sql`true`)
        .leftJoinLateral(productReviewsJson, sql`true`)
        .limit(pageSize + 1)
        .orderBy(sortByClause);
    },

    findBySlug: async (slug: string) => {
      return db.query.products.findFirst({
        where: and(eq(products.slug, slug), eq(products.published, true)),
        columns: {
          id: true,
          title: true,
          summary: true,
          description: true,
        },
        with: {
          brand: {
            columns: {
              name: true,
            },
            with: {
              logo: {
                columns: {
                  url: true,
                },
              },
            },
          },
          variants: {
            columns: {
              id: true,
              name: true,
              stock: true,
              price: true,
              options: true,
            },
            with: {
              thumbnail: {
                columns: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
      });
    },
  },
};
