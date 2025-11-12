import { AppError } from "~/lib/errors/app-error";
import type { CategoriesFindAllInput } from "~/lib/schemas/contracts/public/categories";
import { categoryTreeSchema } from "~/lib/schemas/entities";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _categories = {
  queries: {
    findAll: async (input: CategoriesFindAllInput) => {
      return data.public.categories.queries.findAll(input);
    },

    getSubCategories: async (parentId: string) => {
      const { data: subCategories, error } = await tryCatch(
        data.public.categories.queries.getSubCategories(parentId),
      );
      if (error) {
        throw new AppError("Failed to fetch sub-categories", "INTERNAL", {
          cause: error,
        });
      }

      const parsedData = categoryTreeSchema.array().safeParse(subCategories);
      if (!parsedData.success) {
        console.log(parsedData.error);
        throw new AppError("Failed to parse sub-categories", "VALIDATION", {
          cause: parsedData.error,
        });
      }

      return parsedData.data;
    },
  },
};
