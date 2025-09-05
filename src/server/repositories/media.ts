import { desc, eq, and, gt } from "drizzle-orm";
import { db } from "../db";
import { media, mediaStatusEnum } from "../db/schema";

type NewMediaDto = typeof media.$inferInsert;
type UpdateMediaDto = Partial<NewMediaDto>;

export const _mediaRepository = {
  queries: {
    getPage: ({
      cursor,
      pageSize,
    }: {
      cursor: number | undefined;
      pageSize: number;
    }) => {
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
    async create(data: NewMediaDto) {
      return db
        .insert(media)
        .values(data)
        .returning({ id: media.id })
        .then(([data]) => data);
    },

    async createMany(data: NewMediaDto[]) {
      return db
        .insert(media)
        .values(data)
        .returning({ id: media.id, url: media.url });
    },

    async update(id: number, data: UpdateMediaDto) {
      return db
        .update(media)
        .set(data)
        .where(eq(media.id, id))
        .returning({ id: media.id })
        .then(([data]) => data);
    },

    updateMany(data: (UpdateMediaDto & { id: number })[]) {
      return db.transaction(async (tx) => {
        for (const item of data) {
          const { id, ...data } = item;
          await tx
            .update(media)
            .set(data)
            .where(eq(media.id, id))
            .returning({ id: media.id });
        }
      });
    },

    delete(id: number) {
      return db
        .delete(media)
        .where(eq(media.id, id))
        .returning({ id: media.id });
    },
  },
};
