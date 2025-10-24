import type { ProductsGetPageInput } from "~/lib/schemas/contracts/public/products";
import { paginate } from "../helpers/pagination";
import { data } from "~/server/data-access";
import { AppError } from "~/lib/errors/app-error";
import { tryCatch } from "~/lib/utils/try-catch";
import { cacheTag } from "next/cache";

export const _products = {
  queries: {
    getPage: (input: ProductsGetPageInput) => {
      return paginate({ input, getPage: data.public.products.queries.getPage });
    },

    findBySlug: async (slug: string) => {
      "use cache";
      cacheTag(`product-${slug}`);

      const { data: product, error } = await tryCatch(
        data.public.products.queries.findBySlug(slug),
      );
      if (error) {
        console.error("Error getting product by slug:", error);
        throw new AppError("Couldn't get product", "INTERNAL", {
          cause: error,
        });
      }

      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },

    findAllSlugs: async () => {
      const slugs = await data.public.products.queries.findAllSlugs();

      return slugs;
    },
  },
};
