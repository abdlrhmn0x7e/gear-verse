import type { BrandsGetPageInput } from "@schemas/contracts/admin/brands";
import type { CreateBrandInput } from "@schemas/entities/brand";
import { generateSlug } from "~/lib/utils/slugs";
import { data } from "~/server/data-access";
import { paginate } from "../helpers/pagination";
import { tryCatch } from "~/lib/utils/try-catch";
import { AppError } from "~/lib/errors/app-error";
import { invalidateCache } from "~/server/actions/cache";

export const _brands = {
  queries: {
    getPage: (input: BrandsGetPageInput) => {
      return paginate({ input, getPage: data.admin.brands.queries.getPage });
    },
  },

  mutations: {
    create: async (input: CreateBrandInput) => {
      const { data: brand, error } = await tryCatch(
        data.admin.brands.mutations.create({
          ...input,
          slug: generateSlug(input.name),
        }),
      );

      if (error) {
        throw new AppError("Could not create brand", "INTERNAL", {
          cause: error,
        });
      }

      await invalidateCache("brands");

      return brand;
    },
  },
};
