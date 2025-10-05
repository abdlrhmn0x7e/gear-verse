import { eq, and, gt, ilike, asc } from "drizzle-orm";
import { db } from "../../db";
import { media } from "../../db/schema";

type NewMediaDto = typeof media.$inferInsert;
type UpdateMediaDto = Partial<NewMediaDto>;

export const _media = {
  queries: {
    getPage: ({
      cursor,
      pageSize,
      filters,
    }: {
      cursor: number | undefined;
      pageSize: number;
      filters?: Partial<{
        name: string;
      }>;
    }) => {
      const whereClause = [gt(media.id, cursor ?? 0)];
      if (filters?.name) {
        whereClause.push(ilike(media.name, `%${filters.name}%`));
      }

      return db
        .select({
          id: media.id,
          url: media.url,
          name: media.name,
          mimeType: media.mimeType,
          createdAt: media.createdAt,
        })
        .from(media)
        .where(and(...whereClause))
        .limit(pageSize + 1)
        .orderBy(asc(media.id));
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
        const updatedMedia = [];
        for (const item of data) {
          const { id, ...data } = item;
          const updatedMediaItem = await tx
            .update(media)
            .set(data)
            .where(eq(media.id, id))
            .returning({ id: media.id })
            .then(([data]) => data);
          updatedMedia.push(updatedMediaItem);
        }

        return updatedMedia;
      });
    },
  },
};
