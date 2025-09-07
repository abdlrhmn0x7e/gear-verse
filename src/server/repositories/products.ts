import { eq, gt, ilike, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { brands, media, products } from "../db/schema";
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
            logoUrl: media.url,
          },
        })
        .from(products)
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(media, eq(brands.logoMediaId, media.id))
        .where(and(...whereClause))
        .limit(pageSize + 1)
        .orderBy(products.id);
    },

    findById: (id: number) => {
      return db.transaction(async (tx) => {
        const product = await tx
          .select({
            id: products.id,
            title: products.title,
            description: products.description,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryId: products.categoryId,
            brand: {
              id: brands.id,
              name: brands.name,
              logoUrl: media.url,
            },
          })
          .from(products)
          .leftJoin(brands, eq(products.brandId, brands.id))
          .leftJoin(media, eq(brands.logoMediaId, media.id))
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
            ownerType: media.ownerType,
          })
          .from(media)
          .where(
            and(eq(media.ownerId, product.id), eq(media.ownerType, "PRODUCT")),
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
          .where(and(eq(media.ownerId, id), eq(media.ownerType, "PRODUCT")));

        // delete product
        await tx.delete(products).where(eq(products.id, id));
      });
    },
  },
};
