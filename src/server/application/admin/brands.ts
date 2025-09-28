import type { BrandsGetPageInput } from "@schemas/contracts/admin/brands";
import type { CreateBrandInput } from "@schemas/entities/brand";
import { paginate } from "../helpers/pagination";
import { data } from "~/server/data-access";

export const _brands = {
  queries: {
    getPage: (input: BrandsGetPageInput) => {
      return paginate({ input, getPage: data.admin.brands.queries.getPage });
    },
  },

  mutations: {
    create: (input: CreateBrandInput) => {
      return data.admin.brands.mutations.create(input);
    },
  },
};
