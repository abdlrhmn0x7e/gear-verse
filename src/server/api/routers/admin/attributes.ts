import { tryCatch } from "~/lib/utils/try-catch";
import { errorMap } from "../../error-map";
import { adminProcedure, createTRPCRouter } from "../../init";
import {
  createAttributeInputSchema,
  updateAttributeInputSchema,
} from "~/lib/schemas/entities/attribute";
import z from "zod";

export const attributesRouter = createTRPCRouter({
  queries: {
    getAll: adminProcedure.query(async ({ ctx }) => {
      const { data, error } = await tryCatch(
        ctx.app.admin.attributes.queries.getAll(),
      );

      if (error) {
        throw errorMap(error);
      }

      return data;
    }),
  },

  mutations: {
    create: adminProcedure
      .input(createAttributeInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { data: createdAttribute, error } = await tryCatch(
          ctx.app.admin.attributes.mutations.create(input),
        );
        if (error) {
          throw errorMap(error);
        }

        return createdAttribute;
      }),

    update: adminProcedure
      .input(updateAttributeInputSchema.extend({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const { data: updatedAttribute, error } = await tryCatch(
          ctx.app.admin.attributes.mutations.update(id, data),
        );
        if (error) {
          throw errorMap(error);
        }

        return updatedAttribute;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { data: deletedAttribute, error } = await tryCatch(
          ctx.app.admin.attributes.mutations.delete(input.id),
        );
        if (error) {
          throw errorMap(error);
        }

        return deletedAttribute;
      }),
  },
});
