import { AppError } from "~/lib/errors/app-error";
import type { DeleteCategoryInput } from "~/lib/schemas/contracts/admin/categories";
import {
  categoryTreeSchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "~/lib/schemas/entities";
import { generateSlug } from "~/lib/utils/slugs";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _categories = {
  queries: {
    findAll: async () => {
      const categories = await data.admin.categories.queries.findAll();
      if (!categories) {
        throw new AppError("Categories not found", "NOT_FOUND");
      }

      // validate the sql query results
      const parsedCategories = categoryTreeSchema.array().safeParse(categories);
      if (parsedCategories.error) {
        console.error(parsedCategories.error);
        throw new AppError("Invalid categories", "VALIDATION");
      }

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

      return data.admin.categories.mutations.create({
        ...input,
        slug,
      });
    },

    update: async (input: UpdateCategoryInput) => {
      const { id, ...updatedData } = input;

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

      return updatedCategory;
    },

    delete: async (input: DeleteCategoryInput) => {
      return data.admin.categories.mutations.delete(input.id);
    },
  },
};
