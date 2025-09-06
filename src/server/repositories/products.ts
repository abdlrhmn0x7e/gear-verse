import { eq, gt, ilike, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { brands, media, mediaOwnerTypeEnum, products } from "../db/schema";
import { alias } from "drizzle-orm/pg-core";
import { listingProducts } from "../db/schema/listing-products";

type NewProduct = typeof products.$inferInsert;
type UpdateProduct = Partial<NewProduct>;

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
        .from(products);
    },

    getPage: ({
      cursor,
      pageSize,
      filters,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: {
        title?: string | null;
        brands?: number[] | null;
      };
    }) => {
      const brandsMedia = alias(media, "brandsMedia");
      const whereClause = [gt(products.id, cursor ?? 0)];
      if (filters?.title) {
        whereClause.push(ilike(products.title, `%${filters.title}%`));
      }
      if (filters?.brands) {
        whereClause.push(inArray(products.brandId, filters.brands));
      }

      return db
        .select({
          id: products.id,
          title: products.title,
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
        .leftJoin(brandsMedia, eq(brands.logoMediaId, brandsMedia.id))
        .where(and(...whereClause))
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
            thumbnail: {
              id: media.id,
              url: media.url,
            },
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryId: products.categoryId,
            brand: {
              id: brands.id,
              name: brands.name,
              logo: brandsMedia.url,
            },
          })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
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

    update: (id: number, product: UpdateProduct) => {
      return db
        .update(products)
        .set(product)
        .where(eq(products.id, id))
        .returning({ id: products.id })
        .then(([result]) => result);
    },

    delete: (id: number) => {
      return db.transaction(async (tx) => {
        // delete all listings products
        await tx
          .delete(listingProducts)
          .where(eq(listingProducts.productId, id));

        // delete all media
        await tx
          .delete(media)
          .where(
            and(
              eq(media.ownerId, id),
              eq(media.ownerType, mediaOwnerTypeEnum.enumValues[0]),
            ),
          );

        // delete product
        await tx.delete(products).where(eq(products.id, id));
      });
    },
  },
};
