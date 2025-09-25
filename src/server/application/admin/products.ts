import { AppError } from "~/lib/errors/app-error";
import type { ProductsGetPageInput } from "@schemas/contracts/admin/products";
import { paginate } from "~/server/application/helpers/pagination";
import { data } from "~/server/data-access";

export const _products = {
  queries: {
    getPage: (input: ProductsGetPageInput) => {
      return paginate({ input, getPage: data.admin.products.queries.getPage });
    },

    findById: async (id: number) => {
      const product = await data.admin.products.queries.findById(id);
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },
  },
  mutations: {},
};
