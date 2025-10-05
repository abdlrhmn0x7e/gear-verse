import { data } from "~/server/data-access";

export const _brands = {
  queries: {
    findAll: () => {
      return data.public.brands.queries.findAll();
    },
  },
};
