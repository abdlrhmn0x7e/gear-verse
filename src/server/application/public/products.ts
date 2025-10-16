import type { ProductsGetPageInput } from "~/lib/schemas/contracts/public/products";
import { paginate } from "../helpers/pagination";
import { data } from "~/server/data-access";
import { AppError } from "~/lib/errors/app-error";

export const _products = {
  queries: {
    getPage: (input: ProductsGetPageInput) => {
      console.log("input", input);
      return paginate({ input, getPage: data.public.products.queries.getPage });
    },

    findBySlug: async (slug: string) => {
      const product = await data.public.products.queries.findBySlug(slug);
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },
  },
};
