import type { InventoryItemsGetPageInput } from "~/lib/schemas/contracts/admin/inventory-items";
import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";
import { tryCatch } from "~/lib/utils/try-catch";
import { AppError } from "~/lib/errors/app-error";
import type { UpdateManyInventoryItemsInput } from "~/lib/schemas/entities/inventory-item";

export const _inventoryItems = {
  queries: {
    getPage: async (input: InventoryItemsGetPageInput) => {
      const { data: inventoryItems, error } = await tryCatch(
        paginate({ input, getPage: data.admin.inventoryItems.queries.getPage }),
      );
      if (error) {
        throw new AppError(
          "Failed to get inventory items",
          "INTERNAL",
          undefined,
          error,
        );
      }

      return inventoryItems;
    },
  },

  mutations: {
    async updateMany(input: UpdateManyInventoryItemsInput) {
      const { data: updatedItems, error } = await tryCatch(
        data.admin.inventoryItems.mutations.updateMany(input.inventory),
      );
      if (error) {
        throw new AppError(
          "Failed to update inventory item",
          "INTERNAL",
          undefined,
          error,
        );
      }

      return updatedItems;
    },
  },
};
