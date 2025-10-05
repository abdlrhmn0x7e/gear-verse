import { AppError } from "~/lib/errors/app-error";
import { data } from "~/server/data-access";
import type { CreateProductInput, UpdateProductInput } from "@schemas/entities";
import type { ProductsGetPageInput } from "@schemas/contracts";
import { paginate } from "~/server/application/helpers/pagination";
import { generateSlug } from "~/lib/utils/slugs";
import { generateRandomId } from "~/lib/utils/generate-random-id";

export const _products = {
  queries: {
    getPage: (input: ProductsGetPageInput) => {
      return paginate({ input, getPage: data.admin.products.queries.getPage });
    },

    findById: async (id: number) => {
      const product = await data.admin.products.queries.findById(id);
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },
  },

  mutations: {
    createDeep(input: CreateProductInput) {
      const { options, variants, seo, media, ...product } = input;

      const [thumbnail, ...restMedia] = media;
      if (!thumbnail?.mediaId) {
        throw new AppError("Thumbnail media ID is required", "BAD_REQUEST");
      }

      return data.admin.products.mutations.createDeep({
        newProduct: {
          ...product,
          slug: seo?.urlHandler ?? generateSlug(product.title),
          thumbnailMediaId: thumbnail.mediaId,
        },
        newProdcutMediaIds: restMedia.map((m) => m.mediaId),
        newProductOptions: options,
        newVariants: variants.map((v) => ({
          ...v,
          thumbnail: undefined,
          thumbnailMediaId: v.thumbnail.id,
        })),
        newSeo: seo,
      });
    },

    async editDeep(productId: number, input: UpdateProductInput) {
      const { options, variants, ...product } = input;

      // update the product if there are any changes
      if (Object.keys(product).length > 0) {
        await data.admin.products.mutations.update(productId, {
          ...product,
          media: product.media?.map((m) => m.mediaId) ?? [],
        });
      }

      // variants and options are both required to update them both
      if (variants && options) {
        const oldVariants =
          await data.admin.products.queries.getVariants(productId);
        const newVariantSet = new Set(
          variants.map((v) => v.id ?? generateRandomId()),
        );

        const oldVariantSigs = this.helpers.getVariantSigs(oldVariants);
        const newVariantSigs = this.helpers.getVariantSigs(variants);
        const variantSpace = this.helpers.classifyVariantSpace(
          oldVariantSigs,
          newVariantSigs,
        );

        // update/insert new options
        const { valuesIdToDbId } =
          await data.admin.productOptions.mutations.upsertMany(
            options.map((o, index) => ({
              name: o.name,
              values: o.values.map((v, index) => ({
                ...v,
                order: index + 1,
              })),
              order: index + 1,
              productId,
            })),
          );

        switch (variantSpace) {
          case "NO_SPACE_CHANGE": {
            break;
          }

          case "SPACE_EXPANDS": {
            const toInsert = variants
              .filter((v) => !v.id)
              .map((v) => ({
                ...v,
                thumbnailMediaId: v.thumbnail.id,
                optionValues: v.optionValues,
                stock: v.stock,
              }));
            const toUpdate = variants
              .filter((v) => v.id)
              .map((v) => ({
                ...v,
                thumbnailMediaId: v.thumbnail.id,
                optionValues: v.optionValues,
                stock: v.stock,
                id: v.id!,
              }));

            await data.admin.productVariants.mutations.upsertMany(
              productId,
              toInsert,
              toUpdate,
              valuesIdToDbId,
            );
            break;
          }

          /**
           * Delete old pivots and archive variants
           */
          case "SPACE_CONTRACTS": {
            const toDelete = oldVariants.filter(
              (v) => !newVariantSet.has(v.id),
            );

            await data.admin.productVariants.mutations.deleteOrArchiveMany(
              toDelete.map((v) => v.id),
            );

            break;
          }

          /**
           * Recreate the pivots and delete/archive the old variants
           */
          case "SPACE_MIXED": {
            const toInsert = variants
              .filter((v) => !v.id)
              .map((v) => ({
                ...v,
                thumbnailMediaId: v.thumbnail.id,
                optionValues: v.optionValues,
                stock: v.stock,
              }));

            const toUpdate = variants
              .filter((v) => v.id)
              .map((v) => ({
                ...v,
                thumbnailMediaId: v.thumbnail.id,
                optionValues: v.optionValues,
                stock: v.stock,
                id: v.id!,
              }));

            const toDelete = oldVariants.filter(
              (v) => !newVariantSet.has(v.id),
            );

            await data.admin.productVariants.mutations.recreate({
              productId,
              variantsIds: toDelete.map((v) => v.id),
              toInsert,
              toUpdate,
              valuesIdToDbId,
            });
            break;
          }
        }
      }

      // update the options if there are any changes there only
      if (!variants && options) {
        await data.admin.productOptions.mutations.upsertMany(
          options.map((o, index) => ({
            name: o.name,
            values: o.values.map((v, index) => ({
              ...v,
              order: index + 1,
            })),
            order: index + 1,
            productId,
          })),
        );
      }

      // update the variants if there are any changes there only
      if (variants && !options) {
        await data.admin.productVariants.mutations.updateMany(
          variants.map((v) => ({
            id: v.id!,
            stock: v.stock,
            thumbnailMediaId: v.thumbnail.id,
            overridePrice: v.overridePrice ?? null,
          })),
        );
      }
    },

    helpers: {
      getVariantSigs(variants: Required<UpdateProductInput>["variants"]) {
        return new Set(
          variants.map((v) =>
            Object.values(v.optionValues)
              .map((ov) => ov.id)
              .join("::"),
          ),
        );
      },

      classifyVariantSpace(oldSigs: Set<string>, newSigs: Set<string>) {
        const O = oldSigs,
          N = newSigs;
        const intersection = new Set([...O].filter((sig) => N.has(sig)));
        const onlyOld = O.size - intersection.size;
        const onlyNew = N.size - intersection.size;

        /**
         * NO_SPACE_CHANGE: The variant space has not changed
         * Thus we don't need to update any variants
         * Update the options and option values only
         */
        if (onlyOld === 0 && onlyNew === 0) {
          return "NO_SPACE_CHANGE" as const;
        }

        /**
         * SPACE_EXPANDS: The variant space has expanded
         * Thus we need to create new variants (but keep the old ones and update the pivots)
         */
        if (onlyOld === 0 && onlyNew > 0) {
          return "SPACE_EXPANDS" as const;
        }

        /**
         * SPACE_CONTRACTS: The variant space has contracted
         * Thus we need to archive the old variants and update the pivots
         */
        if (onlyOld > 0 && onlyNew === 0) {
          return "SPACE_CONTRACTS" as const;
        }

        return "SPACE_MIXED" as const;
      },
    },
  },
};
