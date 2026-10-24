import { AppError } from "~/lib/errors/app-error";
import type {
  CategoriesFindAllInput,
  CategoryProductsInput,
} from "~/lib/schemas/contracts/public/categories";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";

/** Categories whose subtree has a product that can be bought, so the store never links to an empty one. */
async function liveCategorySlugs() {
  const rows = await data.public.categories.queries.findWithLiveProducts();
  return new Set(Array.from(rows, (row) => row.slug));
}

export const _categories = {
  queries: {
    findAll: async (input: CategoriesFindAllInput) => {
      return data.public.categories.queries.findAll(input);
    },

    findAllSlugs: async () => {
      return data.public.categories.queries.findAllSlugs();
    },

    findRoots: async () => {
      const { data: result, error } = await tryCatch(
        Promise.all([
          data.public.categories.queries.getRoots(),
          liveCategorySlugs(),
        ]),
      );
      if (error) {
        throw new AppError("Failed to fetch categories", "INTERNAL", {
          cause: error,
        });
      }
      const [roots, live] = result;
      return roots.filter((category) => live.has(category.slug));
    },

    getChildren: async (slug: string) => {
      const { data: result, error } = await tryCatch(
        Promise.all([
          data.public.categories.queries.findChildren(slug),
          liveCategorySlugs(),
        ]),
      );
      if (error) {
        throw new AppError("Failed to fetch sub-categories", "INTERNAL", {
          cause: error,
        });
      }
      const [children, live] = result;
      return children.filter((category) => live.has(category.slug));
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
