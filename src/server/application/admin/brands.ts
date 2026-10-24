import type { BrandsGetPageInput } from "@schemas/contracts/admin/brands";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "@schemas/entities/brand";
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

      await Promise.all([
        invalidateCache("filters"),
        invalidateCache("brands"),
      ]);

      return brand;
    },

    update: async ({ id, ...input }: UpdateBrandInput) => {
      if (input.name === undefined && input.logoMediaId === undefined) {
        throw new AppError("No brand changes provided", "BAD_REQUEST");
      }

      const { data: brand, error } = await tryCatch(
        data.admin.brands.mutations.update(id, input),
      );

      if (error) {
        throw new AppError("Could not update brand", "INTERNAL", {
          cause: error,
        });
      }

      if (!brand) {
        throw new AppError("Brand not found", "NOT_FOUND");
      }

      await Promise.all([
        invalidateCache("filters"),
        invalidateCache("brands"),
      ]);

      return brand;
    },

    delete: async (brandId: number) => {
      const { data: productCount, error: countError } = await tryCatch(
        data.admin.brands.queries.countProducts(brandId),
      );

      if (countError) {
        throw new AppError("Could not check brand usage", "INTERNAL", {
          cause: countError,
        });
      }

      if (productCount > 0) {
        throw new AppError(
          `This brand is used by ${productCount} ${productCount === 1 ? "product" : "products"}. Move its products to another brand first.`,
          "BAD_REQUEST",
        );
      }

      const { data: brand, error } = await tryCatch(
        data.admin.brands.mutations.delete(brandId),
      );

      if (error) {
        throw new AppError("Could not delete brand", "INTERNAL", {
          cause: error,
        });
      }

      await Promise.all([
        invalidateCache("filters"),
        invalidateCache("brands"),
      ]);

      return brand;
    },
  },
};
