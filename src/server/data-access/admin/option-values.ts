import { db } from "~/server/db";
import { productOptionValues } from "~/server/db/schema";

type NewOptionValue = typeof productOptionValues.$inferInsert;

export const _adminOptionValuesRepo = {
  mutations: {
    upsertMany: async (data: NewOptionValue[]) => {
      return db.transaction(async (tx) => {
        const newOptionValues = [];
        for (const item of data) {
          const [newOptionValue] = await tx
            .insert(productOptionValues)
            .values(item)
            .onConflictDoUpdate({ target: productOptionValues.id, set: item })
            .returning({ id: productOptionValues.id });

          if (!newOptionValue) {
            throw new Error("Failed to create product option value");
          }

          newOptionValues.push(newOptionValue);
        }

        return newOptionValues;
      });
    },
  },
};
