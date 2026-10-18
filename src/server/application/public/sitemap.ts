import { data } from "~/server/data-access";

export const _sitemap = {
  queries: {
    findEntries: async () => {
      return data.public.sitemap.queries.findEntries();
    },
  },
};
