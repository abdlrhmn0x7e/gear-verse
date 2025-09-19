import { db } from "~/server/db";
import { eq, inArray } from "drizzle-orm";
import { productVariants } from "~/server/db/schema";

export const _userProductVariantsRepository = {
  queries: {
    getStock: async (id: number) => {
      return db
        .select({ stock: productVariants.stock })
        .from(productVariants)
        .where(eq(productVariants.id, id))
        .limit(1)
        .then((res) => res[0]);
    },

    getItemsStock: async (ids: number[]) => {
      return db
        .select({ id: productVariants.id, stock: productVariants.stock })
        .from(productVariants)
        .where(inArray(productVariants.id, ids));
    },
  },
};
