import { db } from "../db";
import { media } from "../db/schema";

type NewMedia = typeof media.$inferInsert;

export const _mediaRepository = {
  queries: {},
  mutations: {
    create: (data: NewMedia) => {
      return db.insert(media).values(data);
    },
  },
};
