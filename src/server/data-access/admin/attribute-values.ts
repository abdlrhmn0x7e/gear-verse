import { eq, asc } from "drizzle-orm";
import { db } from "~/server/db";
import { attributeValues } from "~/server/db/schema/attributes";

type CreateAttributeValueInput = typeof attributeValues.$inferInsert;
type UpdateAttributeValueInput = Partial<CreateAttributeValueInput> & {
  attributeId: number;
};

export const _attributeValues = {
  queries: {
    findAll(attributeId: number) {
      return db
        .select({
          id: attributeValues.id,
          value: attributeValues.value,
        })
        .from(attributeValues)
        .where(eq(attributeValues.attributeId, attributeId))
        .orderBy(asc(attributeValues.id));
    },
  },

  mutations: {
    async create(input: CreateAttributeValueInput) {
      return db
        .insert(attributeValues)
        .values(input)
        .returning({
          id: attributeValues.id,
        })
        .then(([res]) => res);
    },

    async delete(id: number) {
      return db
        .delete(attributeValues)
        .where(eq(attributeValues.id, id))
        .returning({
          id: attributeValues.id,
        })
        .then(([res]) => res);
    },
  },
};
