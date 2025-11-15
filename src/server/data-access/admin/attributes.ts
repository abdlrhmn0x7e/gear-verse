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

    getCategoryAttributes: async (categoryId: number) => {
      return db
        .select({
          id: attributes.id,
          name: attributes.name,
          slug: attributes.slug,
          type: attributes.type,
          valueId: attributeValues.id,
          value: attributeValues.value,
        })
        .from(attributes)
        .innerJoin(
          attributeValues,
          eq(attributes.id, attributeValues.attributeId),
        )
        .innerJoin(
          categoryAttributes,
          and(
            eq(categoryAttributes.categoryId, categoryId),
            eq(categoryAttributes.attributeId, attributes.id),
          ),
        )
        .orderBy(asc(categoryAttributes.order));
    },

    getAllWithValues() {
      type Value = { id: number; value: string; slug: string };
      const attributeValuesJsonCTE = db.$with("attribute_values_json_cte").as(
        db
          .select({
            attributeId: attributeValues.attributeId,
            json: sql<Value[]>`
                jsonb_agg(
                  jsonb_build_object(
                    'id', ${attributeValues.id},
                    'value', ${attributeValues.value},
                    'slug', ${attributeValues.slug}
                    )
                )
              `.as("values_json"),
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
          values: sql<
            Value[]
          >`coalesce(${attributeValuesJsonCTE.json}, '[]'::jsonb)`,
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
      return db.transaction(async (tx) => {
        const res = await tx
          .insert(attributes)
          .values(input)
          .returning({
            id: attributes.id,
            name: attributes.name,
            slug: attributes.slug,
            type: attributes.type,
          })
          .then(([res]) => res);

        if (!res) {
          throw new Error("Failed to create an attribute");
        }

        // create a true value for the boolean
        if (res.type === "BOOLEAN") {
          tx.insert(attributeValues).values({
            value: "true",
            slug: "true",
            attributeId: res.id,
          });
        }

        return res;
      });
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
        .returning({
          id: attributes.id,
          name: attributes.name,
          slug: attributes.slug,
          type: attributes.type,
        })
        .then(([res]) => res);
    },

    delete(id: number) {
      return db
        .delete(attributes)
        .where(eq(attributes.id, id))
        .returning({ id: attributes.id });
    },
  },
};
