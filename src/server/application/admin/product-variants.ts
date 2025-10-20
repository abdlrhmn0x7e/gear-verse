import { AppError } from "~/lib/errors/app-error";
import type { UpdateProductVariantInput } from "~/lib/schemas/entities/product-variants";
import { tryCatch } from "~/lib/utils/try-catch";
import { data } from "~/server/data-access";

export const _productVariants = {
  queries: {
    async findById(id: number) {
      const { data: variant, error } = await tryCatch(
        data.admin.productVariants.queries.findById(id),
      );

      if (error) {
        throw new AppError("Couldn't find product variant", "INTERNAL", {
          cause: error,
        });
      }
      if (!variant) {
        throw new AppError("Product variant not found", "NOT_FOUND");
      }

      return variant;
    },

    async findProductById(productId: number) {
      const { data: product, error } = await tryCatch(
        data.admin.productVariants.queries.findByProductId(productId),
      );

      if (error) {
        throw new AppError("Couldn't find product", "INTERNAL", {
          cause: error,
        });
      }
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },
  },

  mutations: {
    async update(input: UpdateProductVariantInput) {
      const { data: variant, error } = await tryCatch(
        data.admin.productVariants.mutations.update({
          id: input.id,
          overridePrice: input.overridePrice,
          stock: input.inventory?.quantity,
          thumbnailMediaId: input.thumbnail?.mediaId,
          values: input.options?.map((option) => Object.values(option)[0]!),
        }),
      );

      if (error) {
        throw new AppError("Couldn't update product variant", "INTERNAL", {
          cause: error,
        });
      }

      return variant;
    },
  },
};
