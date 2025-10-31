import { data } from "~/server/data-access";
import type { Pagination } from "~/server/data-access/common/types";
import { paginate } from "../helpers/pagination";
import type { UsersGetPageInput } from "~/lib/schemas/contracts";
import type { CreateUserInput } from "~/lib/schemas/entities/users";

export const _users = {
  queries: {
    getPage: async (input: UsersGetPageInput) => {
      return paginate({ input, getPage: data.admin.users.queries.getPage });
    },

    getCount: async () => {
      return data.admin.users.queries.getCount();
    },
  },

  mutations: {
    create: async (input: CreateUserInput) => {
      return data.admin.users.mutations.create(input);
    },
  },
};
