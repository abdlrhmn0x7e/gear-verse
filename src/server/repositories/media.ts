import { desc, eq, lt, and, gt } from "drizzle-orm";
import { db } from "../db";
import { media, mediaStatusEnum } from "../db/schema";

type NewMediaDto = typeof media.$inferInsert;
type UpdateMediaDto = Partial<NewMediaDto>;

export const _mediaRepository = {
  queries: {
    getPage({
      cursor,
      pageSize,
    }: {
      cursor: number | undefined;
      pageSize: number;
    }) {
      return db
        .select({ id: media.id, url: media.url })
        .from(media)
        .where(
          and(
            gt(media.id, cursor ?? 0),
            eq(media.status, mediaStatusEnum.enumValues[1]),
          ),
        )
        .limit(pageSize + 1)
        .orderBy(desc(media.id));
    },
  },

  mutations: {
    create: (data: NewMediaDto) => {
      return db
        .insert(media)
        .values(data)
        .returning({ id: media.id })
        .then(([data]) => data);
    },

    update: (id: number, data: UpdateMediaDto) => {
      return db
        .update(media)
        .set(data)
        .where(eq(media.id, id))
        .returning({ id: media.id })
        .then(([data]) => data);
    },
  },
};
