import { AppError } from "~/lib/errors/app-error";
import type {
  ConnectCategoryAttributeInput,
  CreateAttributeInput,
  UpdateAttributeInput,
} from "~/lib/schemas/entities/attribute";
import { generateSlug } from "~/lib/utils/slugs";
import { tryCatch } from "~/lib/utils/try-catch";
import { invalidateCache } from "~/server/actions/cache";
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

    async getCategoryAttributes(categoryId: number) {
      const { data: attributes, error } = await tryCatch(
        data.admin.attributes.queries.getCategoryAttributes(categoryId),
      );

      if (error) {
        console.error("Error fetching category attributes:", error);
        throw new AppError("Failed to fetch category attributes", "INTERNAL", {
          cause: error,
        });
      }

      return attributes;
    },

    async getAllConnections() {
      const { data: connections, error } = await tryCatch(
        data.admin.attributes.queries.getAllConnections(),
      );

      if (error) {
        throw new AppError("Failed to fetch connections", "INTERNAL", {
          cause: error,
        });
      }

      return connections;
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

      await invalidateCache("category-filters");

      return createdAttribute;
    },

    async update(id: number, input: UpdateAttributeInput) {
      const { data: updatedAttribute, error } = await tryCatch(
        data.admin.attributes.mutations.update(id, input),
      );
      if (error || !updatedAttribute) {
        throw new AppError("Failed to update attribute", "INTERNAL", {
          cause: error,
        });
      }

      await invalidateCache("category-filters");
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

      await invalidateCache("category-filters");
      return deletedAttribute;
    },

    async connect(input: ConnectCategoryAttributeInput) {
      const { data: connection, error } = await tryCatch(
        data.admin.attributes.mutations.connect(input),
      );
      if (error) {
        throw new AppError("Failed to connect attribute", "INTERNAL", {
          cause: error,
        });
      }

      await invalidateCache("category-filters");
      return connection;
    },

    async disconnect(input: ConnectCategoryAttributeInput) {
      const { data: connection, error } = await tryCatch(
        data.admin.attributes.mutations.disconnect(input),
      );
      if (error) {
        throw new AppError("Failed to disconnect attribute", "INTERNAL", {
          cause: error,
        });
      }

      await invalidateCache("category-filters");
      return connection;
    },
  },
};
