import { desc, eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export const _users = {
  queries: {
    getCustomerSummary: async () => {
      const latestUsersCte = db.$with("latest_users_cte").as(
        db
          .select({
            name: users.name,
            image: users.image,
          })
          .from(users)
          .where(eq(users.isAnonymous, false))
          .orderBy(desc(users.id)) // Assuming 'id' can be used to determine latest if 'createdAt' isn't available
          .limit(5),
      );

      return db
        .with(latestUsersCte)
        .select({
          summary: sql<Array<{ name: string; image: string | null }>>`(
                      SELECT json_agg(
                        jsonb_build_object(
                          'name', ${latestUsersCte.name},
                          'image', ${latestUsersCte.image}
                        )
                      )
                      FROM ${latestUsersCte}
                   )`.as("summary"),

          count: sql<number>`(SELECT COUNT(*) FROM ${users})`.as("count"),
        })
        .from(users)
        .then(([res]) => res);
    },
  },
};
