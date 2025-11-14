import { AppError } from "~/lib/errors/app-error";
import type {
  CreateAttributeInput,
  UpdateAttributeInput,
} from "~/lib/schemas/entities/attribute";
import type { CreateAttributeValueInput } from "~/lib/schemas/entities/attribute-value";
import { generateSlug } from "~/lib/utils/slugs";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _attributes = {
  queries: {
    async getAll() {
      const { data: attributes, error } = await tryCatch(
        data.admin.attributes.queries.getAll(),
      );

      if (error) {
        throw new AppError("Failed to fetch attributes", "INTERNAL", {
          cause: error,
        });
      }

      return attributes;
    },
  },

  mutations: {
    async create(input: CreateAttributeInput) {
      const { data: createdAttribute, error } = await tryCatch(
        data.admin.attributes.mutations.create({
          ...input,
          slug: generateSlug(input.name),
        }),
      );
      if (error || !createdAttribute) {
        throw new AppError("Failed to create attribute", "INTERNAL", {
          cause: error,
        });
      }

      return createdAttribute;
    },

    async update(id: number, input: UpdateAttributeInput) {
      const { data: updatedAttribute, error } = await tryCatch(
        data.admin.attributes.mutations.update(id, input),
      );
      if (error) {
        throw new AppError("Failed to update attribute", "INTERNAL", {
          cause: error,
        });
      }

      return updatedAttribute;
    },

    async delete(id: number) {
      const { data: deletedAttribute, error } = await tryCatch(
        data.admin.attributes.mutations.delete(id),
      );
      if (error) {
        throw new AppError("Failed to delete attribute", "INTERNAL", {
          cause: error,
        });
      }

      return deletedAttribute;
    },
  },
};
