import { db } from "../db";
import { products } from "../db/schema";

type NewProduct = typeof products.$inferInsert;
export const _productsRepository = {
  mutations: {
    create: (product: NewProduct) => {
      return db.insert(products).values(product);
    },
  },
};
