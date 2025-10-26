import { cacheTag } from "next/cache";
import type { CategoriesFindAllInput } from "~/lib/schemas/contracts/public/categories";
import { data } from "~/server/data-access";

export const _categories = {
  queries: {
    findAll: async (input: CategoriesFindAllInput) => {
      "use cache";
      cacheTag("categories");

      return data.public.categories.queries.findAll(input);
    },
  },
};
