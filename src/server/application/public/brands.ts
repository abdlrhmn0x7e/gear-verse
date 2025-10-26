import { cacheTag } from "next/cache";
import { data } from "~/server/data-access";

export const _brands = {
  queries: {
    findAll: async () => {
      "use cache";
      cacheTag("brands");

      return data.public.brands.queries.findAll();
    },
  },
};
