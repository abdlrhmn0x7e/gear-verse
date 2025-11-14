import { AppError } from "~/lib/errors/app-error";
import type { CreateAttributeValueInput } from "~/lib/schemas/entities/attribute-value";
import { generateSlug } from "~/lib/utils/slugs";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _attributeValues = {
  queries: {
    async findAll(attributeId: number) {
      const { data: values, error } = await tryCatch(
        data.admin.attributeValues.queries.findAll(attributeId),
      );

      if (error) {
        throw new AppError("Failed to fetch attribute values", "INTERNAL", {
          cause: error,
        });
      }

      return values;
    },
  },

  mutations: {
    async create(input: CreateAttributeValueInput) {
      const { data: value, error } = await tryCatch(
        data.admin.attributeValues.mutations.create({
          ...input,
          slug: generateSlug(input.value),
        }),
      );

      if (error) {
        throw new AppError("Failed to create attribute value", "INTERNAL", {
          cause: error,
        });
      }

      return value;
    },

    async delete(id: number) {
      const { data: value, error } = await tryCatch(
        data.admin.attributeValues.mutations.delete(id),
      );

      if (error) {
        throw new AppError("Failed to delete attribute value", "INTERNAL", {
          cause: error,
        });
      }

      return value;
    },
  },
};
