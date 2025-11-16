import type { BrandsFindAllInput } from "~/lib/schemas/contracts/public/brands";
import { data } from "~/server/data-access";

export const _brands = {
  queries: {
    findAll: async (input?: BrandsFindAllInput) => {
      return data.public.brands.queries.findAll(input?.filters);
    },
  },
};
