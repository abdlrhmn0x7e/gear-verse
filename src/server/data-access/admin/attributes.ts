import { sql, asc, eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { categories } from "~/server/db/schema";
import {
  attributes,
  attributeValues,
  categoryAttributes,
} from "~/server/db/schema/attributes";

type CreateAttributeInput = typeof attributes.$inferInsert;
type UpdateAttributeInput = Partial<typeof attributes.$inferInsert>;

export const _attributes = {
  queries: {
    getAll() {
      return db
        .select({
          id: attributes.id,
          name: attributes.name,
          slug: attributes.slug,
          type: attributes.type,
        })
        .from(attributes)
        .orderBy(asc(attributes.id));
    },

    getAllWithValues() {
      const attributeValuesJsonCTE = db.$with("attribute_values_json_cte").as(
        db
          .select({
            attributeId: attributeValues.attributeId,
            json: sql<
              { id: number; value: string; slug: string; order: number }[]
            >`
                jsonb_agg(
                  jsonb_build_object(
                    'id', ${attributeValues.id},
                    'value', ${attributeValues.value},
                    'slug', ${attributeValues.slug},
                    )
                )
              `,
          })
          .from(attributeValues)
          .groupBy(attributeValues.attributeId),
      );

      return db
        .with(attributeValuesJsonCTE)
        .select({
          id: attributes.id,
          name: attributes.name,
          slug: attributes.slug,
          type: attributes.type,
          values: attributeValuesJsonCTE.json,
        })
        .from(attributes)
        .leftJoin(
          attributeValuesJsonCTE,
          eq(attributes.id, attributeValuesJsonCTE.attributeId),
        );
    },

    async getAllConnections() {
      return db
        .select({
          attribute: {
            id: categoryAttributes.attributeId,
            slug: sql<string>`${attributes.slug}`,
          },
          category: {
            id: categoryAttributes.categoryId,
            slug: sql<string>`${categories.slug}`,
          },
        })
        .from(categoryAttributes)
        .leftJoin(attributes, eq(attributes.id, categoryAttributes.attributeId))
        .leftJoin(categories, eq(categories.id, categoryAttributes.categoryId));
    },
  },

  mutations: {
    async create(input: CreateAttributeInput) {
      return db
        .insert(attributes)
        .values(input)
        .returning({
          id: attributes.id,
          name: attributes.name,
          slug: attributes.slug,
          type: attributes.type,
        })
        .then(([res]) => res);
    },

    async connect({
      categoryId,
      attributeId,
    }: {
      categoryId: number;
      attributeId: number;
    }) {
      return db.transaction(async (tx) => {
        const last = await tx
          .select({ max: sql<number>`max(${categoryAttributes.order})` })
          .from(categoryAttributes)
          .where(eq(categoryAttributes.categoryId, categoryId))
          .then(([res]) => res);

        const nextOrder = last?.max ?? 0;

        return await tx
          .insert(categoryAttributes)
          .values({ categoryId, attributeId, order: nextOrder })
          .returning();
      });
    },

    async disconnect({
      categoryId,
      attributeId,
    }: {
      categoryId: number;
      attributeId: number;
    }) {
      return db
        .delete(categoryAttributes)
        .where(
          and(
            eq(categoryAttributes.attributeId, attributeId),
            eq(categoryAttributes.categoryId, categoryId),
          ),
        );
    },

    update(id: number, input: UpdateAttributeInput) {
      return db
        .update(attributes)
        .set(input)
        .where(eq(attributes.id, id))
        .returning({ id: attributes.id });
    },

    delete(id: number) {
      return db
        .delete(attributes)
        .where(eq(attributes.id, id))
        .returning({ id: attributes.id });
    },
  },
};
