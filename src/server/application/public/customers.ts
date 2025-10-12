import { data } from "~/server/data-access";

export const _customers = {
  queries: {
    getCustomerSummary: async () => {
      return data.public.users.queries.getCustomerSummary();
    },
  },
};
