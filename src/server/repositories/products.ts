import { eq, gt, ilike, and } from "drizzle-orm";
import { db } from "../db";
import { brands, media, mediaOwnerTypeEnum, products } from "../db/schema";
import { alias } from "drizzle-orm/pg-core";

type NewProduct = typeof products.$inferInsert;
export const _productsRepository = {
  queries: {
    findAll() {
      return db
        .select({
          id: products.id,
          title: products.title,
          thumbnailUrl: media.url,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(media, eq(products.thumbnailMediaId, media.id));
    },

    getPage: ({
      cursor,
      pageSize,
      title,
    }: {
      cursor: number | undefined;
      pageSize: number;
      title?: string | null;
    }) => {
      const brandsMedia = alias(media, "brandsMedia");
      return db
        .select({
          id: products.id,
          title: products.title,
          thumbnailUrl: media.url,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          brand: {
            id: brands.id,
            name: brands.name,
            logo: brandsMedia.url,
          },
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(media, eq(products.thumbnailMediaId, media.id))
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .where(
          and(
            gt(products.id, cursor ?? 0),
            ilike(products.title, `%${title ?? ""}%`),
          ),
        )
        .limit(pageSize + 1)
        .orderBy(products.id);
    },

    findById: (id: number) => {
      const brandsMedia = alias(media, "brandsMedia");
      return db.transaction(async (tx) => {
        const product = await tx
          .select({
            id: products.id,
            title: products.title,
            description: products.description,
            thumbnailUrl: media.url,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            brand: {
              id: brands.id,
              name: brands.name,
              logo: brandsMedia.url,
            },
          })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
          .leftJoin(media, eq(products.thumbnailMediaId, media.id))
          .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
          .where(eq(products.id, id))
          .limit(1)
          .then(([result]) => result);

        if (!product) {
          return product;
        }

        const productMedia = await tx
          .select({
            id: media.id,
            url: media.url,
          })
          .from(media)
          .where(
            and(
              eq(media.ownerId, product.id),
              eq(media.ownerType, mediaOwnerTypeEnum.enumValues[0]),
            ),
          );

        return {
          ...product,
          media: productMedia,
        };
      });
    },
  },
  mutations: {
    create: (product: NewProduct) => {
      return db
        .insert(products)
        .values(product)
        .returning({ id: products.id })
        .then(([result]) => result);
    },
  },
};
