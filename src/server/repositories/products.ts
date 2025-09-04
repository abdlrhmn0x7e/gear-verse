import { db } from "../db";
import { products } from "../db/schema";

type NewProduct = typeof products.$inferInsert;
export const _productsRepository = {
  queries: {
    all: () => {
      return db
        .select({
          id: products.id,
          title: products.title,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products);
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
