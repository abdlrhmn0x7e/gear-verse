import { sql, asc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { attributes, attributeValues } from "~/server/db/schema/attributes";

type CreateAttributeInput = typeof attributes.$inferInsert;
type UpdateAttributeInput = Partial<typeof attributes.$inferInsert>;

type CreateAttributeValueInput = typeof attributeValues.$inferInsert;

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

    getValues(id: number) {
      return db
        .select({
          id: attributeValues.id,
          value: attributeValues.value,
        })
        .from(attributeValues)
        .where(eq(attributeValues.attributeId, id))
        .orderBy(asc(attributeValues.id));
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

    async addValue(input: CreateAttributeValueInput) {
      return db
        .insert(attributeValues)
        .values(input)
        .returning({
          id: attributeValues.id,
        })
        .then(([res]) => res);
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
