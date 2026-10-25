import type { ProductsGetPageInput } from "~/lib/schemas/contracts/public/products";
import { paginate } from "../helpers/pagination";
import { data } from "~/server/data-access";
import { AppError } from "~/lib/errors/app-error";
import { tryCatch } from "~/lib/utils/try-catch";
import type { Locale } from "~/i18n/routing";

export const _products = {
  queries: {
    getPage: (input: ProductsGetPageInput) => {
      return paginate({ input, getPage: data.public.products.queries.getPage });
    },

    findBySlug: async (slug: string, locale: Locale, includeDrafts = false) => {
      const { data: product, error } = await tryCatch(
        data.public.products.queries.findBySlug(slug, {
          includeDrafts,
          locale,
        }),
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

    findMetadata: async (slug: string, locale: Locale) => {
      const { data: product, error } = await tryCatch(
        data.public.products.queries.findMetadata(slug, locale),
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

    getPriceRange: (filters?: Partial<{ categorySlug: string }>) => {
      return data.public.products.queries.getPriceRange(filters);
    },

    findAllSlugs: async () => {
      const slugs = await data.public.products.queries.findAllSlugs();

      return slugs;
    },
  },
};
