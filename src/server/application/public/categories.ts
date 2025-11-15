import { AppError } from "~/lib/errors/app-error";
import type {
  CategoriesFindAllInput,
  CategoryProductsInput,
} from "~/lib/schemas/contracts/public/categories";
import { categoryTreeSchema } from "~/lib/schemas/entities";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";

export const _categories = {
  queries: {
    findAll: async (input: CategoriesFindAllInput) => {
      return data.public.categories.queries.findAll(input);
    },

    findRoots: async () => {
      const { data: roots, error } = await tryCatch(
        data.public.categories.queries.getRoots(),
      );
      if (error) {
        throw new AppError("Failed to fetch categories", "INTERNAL", {
          cause: error,
        });
      }
      return roots;
    },

    getProductsPage: async (input: CategoryProductsInput) => {
      return paginate({
        input,
        getPage: data.public.categories.queries.getProductsPage,
      });
    },

    getAttributes: async (parentId: string) => {
      const { data: attributes, error } = await tryCatch(
        data.public.categories.queries.getAttributes(parentId),
      );
      if (error || !attributes) {
        throw new AppError("Failed to fetch sub-categories", "INTERNAL", {
          cause: error,
        });
      }
      return attributes;
    },
  },
};
