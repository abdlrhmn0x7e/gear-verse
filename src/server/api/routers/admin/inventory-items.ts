import { tryCatch } from "~/lib/utils/try-catch";
import { createTRPCRouter } from "../../trpc";
import { adminProcedure } from "../../trpc";
import { errorMap } from "../../error-map";
import { inventoryItemsGetPageInputSchema } from "~/lib/schemas/contracts/admin/inventory-items";

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
});
