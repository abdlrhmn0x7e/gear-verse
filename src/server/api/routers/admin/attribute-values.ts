import z from "zod";
import { adminProcedure, createTRPCRouter } from "../../init";
import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import {
  createAttributeValueInputSchema,
  updateAttributeValueInputSchema,
} from "~/lib/schemas/entities/attribute-value";

export const attributeValuesRouter = createTRPCRouter({
  queries: {
    findAll: adminProcedure
      .input(z.object({ attributeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.attributeValues.queries.findAll(input.attributeId),
        );

        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },

  mutations: {
    create: adminProcedure
      .input(createAttributeValueInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.attributeValues.mutations.create(input),
        );

        if (error) {
          throw errorMap(error);
        }

        return data;
      }),

    update: adminProcedure
      .input(updateAttributeValueInputSchema)
      .mutation(({ ctx, input }) => {}),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data, error } = await tryCatch(
          ctx.app.admin.attributeValues.mutations.delete(input.id),
        );

        if (error) {
          throw errorMap(error);
        }

        return data;
      }),
  },
});
