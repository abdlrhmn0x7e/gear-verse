import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter, adminProcedure } from "~/server/api/init";
import { errorMap } from "../../error-map";
import { inventoryItemsGetPageInputSchema } from "~/lib/schemas/contracts/admin/inventory-items";
import { updateManyInventoryItemsInputSchema } from "~/lib/schemas/entities/inventory-item";

export const inventoryItemsRouter = createTRPCRouter({
  /**
   * Queries
   */
  queries: {
    getPage: adminProcedure
      .input(inventoryItemsGetPageInputSchema)
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.inventoryItems.queries.getPage(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },

  /**
   *  Mutations
   */
  mutations: {
    updateMany: adminProcedure
      .input(updateManyInventoryItemsInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.inventoryItems.mutations.updateMany(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
