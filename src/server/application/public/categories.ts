import type { CategoriesFindAllInput } from "~/lib/schemas/contracts/public/categories";
import { data } from "~/server/data-access";

export const _categories = {
  queries: {
    findAll: async (input: CategoriesFindAllInput) => {
      return data.public.categories.queries.findAll(input);
    },
  },
};
