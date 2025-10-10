import { AppError } from "~/lib/errors/app-error";
import type { DeleteCategoryInput } from "~/lib/schemas/contracts/admin/categories";
import {
  categoryTreeSchema,
  type CreateCategoryInput,
} from "~/lib/schemas/entities";
import { generateSlug } from "~/lib/utils/slugs";
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

    delete: async (input: DeleteCategoryInput) => {
      return data.admin.categories.mutations.delete(input.id);
    },
  },
};
