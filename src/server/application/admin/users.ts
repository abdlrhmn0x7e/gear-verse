import { data } from "~/server/data-access";

export const _users = {
  queries: {
    getCount: async () => {
      return data.admin.users.queries.getCount();
    },
  },
};
