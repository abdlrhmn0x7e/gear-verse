import { db } from "~/server/db";
import { eq, inArray } from "drizzle-orm";
import { variants } from "~/server/db/schema";

export const _userVariantsRepo = {
  queries: {
    getStock: async (id: number) => {
      return db
        .select({ stock: variants.stock })
        .from(variants)
        .where(eq(variants.id, id))
        .limit(1)
        .then((res) => res[0]);
    },

    getItemsStock: async (ids: number[]) => {
      return db
        .select({ id: variants.id, stock: variants.stock })
        .from(variants)
        .where(inArray(variants.id, ids));
    },
  },
};
