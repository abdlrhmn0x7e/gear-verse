import { AppError } from "~/lib/errors/app-error";
import type { DeleteCategoryInput } from "~/lib/schemas/contracts/admin/categories";
import {
  categoryTreeSchema,
  type CreateCategoryInput,
  type MinimalCategory,
  type UpdateCategoryInput,
} from "~/lib/schemas/entities";
import { generateSlug } from "~/lib/utils/slugs";
import { tryCatch } from "~/lib/utils/try-catch";
import { invalidateCategories } from "~/server/actions/cache";
import { data } from "~/server/data-access";

export const _categories = {
  queries: {
    findRoots: async () => {
      const categories = await data.admin.categories.queries.findAll({
        filters: { root: true },
      });
      if (!categories) {
        throw new AppError("Categories not found", "NOT_FOUND");
      }

      return categories as MinimalCategory[];
    },

    findAll: async () => {
      const categories = await data.admin.categories.queries.findAll();
      if (!categories) {
        throw new AppError("Categories not found", "NOT_FOUND");
      }

      const parsedCategories = categoryTreeSchema.array().safeParse(categories);
      if (!parsedCategories.success)
        throw new AppError("Failed to parse categories", "VALIDATION", {
          cause: parsedCategories.error,
        });

      return parsedCategories.data;
    },
  },

  mutations: {
    create: async (input: CreateCategoryInput) => {
      const parentCategory = input.parent_id
        ? await data.admin.categories.queries.findById(input.parent_id)
        : undefined;

      let slug;
      if (parentCategory) {
        slug = generateSlug(parentCategory.slug + "-" + input.name);
      } else {
        slug = generateSlug(input.name);
      }

      const { data: createdCategory, error } = await tryCatch(
        data.admin.categories.mutations.create({
          ...input,
          slug,
        }),
      );

      if (error) {
        throw new AppError(
          "This Category Already Exist, Change it's name and try again",
          "INTERNAL",
          {
            cause: error,
          },
        );
      }

      await invalidateCategories();
      return createdCategory;
    },

    update: async (input: UpdateCategoryInput) => {
      const { id, ...updatedData } = input;

      // nesting a category under itself or one of its own sub-categories
      // makes a loop, and the whole branch drops out of the tree
      if (typeof updatedData.parent_id === "number") {
        const parentLine =
          await data.admin.categories.queries.findSelfAndAncestorIds(
            updatedData.parent_id,
          );

        if (parentLine.includes(id)) {
          throw new AppError(
            "A category can't move inside itself or one of its sub-categories.",
            "BAD_REQUEST",
          );
        }
      }

      const { data: updatedCategory, error } = await tryCatch(
        data.admin.categories.mutations.update(id, updatedData),
      );

      if (error) {
        throw new AppError("Failed to update category", "INTERNAL", {
          cause: error,
        });
      }

      if (!updatedCategory) {
        throw new AppError("Category not found", "NOT_FOUND", {
          cause: error,
        });
      }

      await invalidateCategories();
      return updatedCategory;
    },

    delete: async (input: DeleteCategoryInput) => {
      const { data: deletedCategories, error } = await tryCatch(
        data.admin.categories.mutations.delete(input.id),
      );

      if (error) {
        throw new AppError("Could not delete category", "INTERNAL", {
          cause: error,
        });
      }

      await invalidateCategories();
      return deletedCategories;
    },
  },
};
