import { DB } from "~/server/repositories";
import { adminProcedure, createTRPCRouter } from "../../trpc";
import { brandSchema } from "~/lib/schemas/brand";
import { paginationSchema } from "~/lib/schemas/pagination";
import { paginate } from "../../helpers/pagination";
import { generateSlug } from "~/lib/utils/slugs";

export const brandsRouter = createTRPCRouter({
  /**
   * Queries
   */
  getPage: adminProcedure.input(paginationSchema).query(({ input }) => {
    return paginate({ input, getPage: DB.admin.brands.queries.getPage });
  }),

  /**
   * Mutations
   */
  create: adminProcedure
    .input(
      brandSchema.omit({
        id: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(({ input }) => {
      return DB.admin.brands.mutations.create({
        ...input,
        slug: generateSlug(input.name),
      });
    }),
});
