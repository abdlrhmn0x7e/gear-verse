import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter } from "../../trpc";
import { adminProcedure } from "../../trpc";
import { errorMap } from "../../error-map";
import { inventoryItemsGetPageInputSchema } from "~/lib/schemas/contracts/admin/inventory-items";
import { updateInventoryItemInputSchema } from "~/lib/schemas/entities/inventory-item";

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
      .input(updateInventoryItemInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.inventoryItems.mutations.update(input),
        );
        if (error) {
          throw errorMap(error);
        }
        return data;
      }),
  },
});
