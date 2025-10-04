import { db } from "~/server/db";
import { productOptions, productOptionValues } from "~/server/db/schema";

type NewOption = typeof productOptions.$inferInsert & {
  values: { id: number; value: string; order: number }[];
};

export const _adminOptions = {
  mutations: {
    upsertMany: async (data: NewOption[]) => {
      const valuesIdToDbId = new Map<number, number>();
      return db.transaction(async (tx) => {
        const newOptions = [];
        for (const item of data) {
          const [newOption] = await tx
            .insert(productOptions)
            .values({ productId: item.productId, name: item.name })
            .onConflictDoUpdate({
              target: [productOptions.productId, productOptions.name],
              set: { name: item.name, order: item.order },
            })
            .returning({ id: productOptions.id });

          if (!newOption) {
            throw new Error("Failed to create product option");
          }

          // create/update option values
          for (const value of item.values) {
            const [newOptionValue] = await tx
              .insert(productOptionValues)
              .values({ value: value.value, productOptionId: newOption.id })
              .onConflictDoUpdate({
                target: [
                  productOptionValues.productOptionId,
                  productOptionValues.value,
                ],
                set: { value: value.value, order: value.order },
              })
              .returning({ id: productOptionValues.id });

            if (!newOptionValue) {
              throw new Error("Failed to create product option value");
            }

            valuesIdToDbId.set(value.id, newOptionValue.id);
          }

          newOptions.push({ ...newOption, values: item.values });
        }

        return { newOptions, valuesIdToDbId };
      });
    },
  },
};
