/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { AppError } from "~/lib/errors/app-error";
import { data } from "~/server/data-access";
import type { CreateProductInput, UpdateProductInput } from "@schemas/entities";
import type { ProductsFilter, ProductsGetPageInput } from "@schemas/contracts";
import { paginate } from "~/server/application/helpers/pagination";
import { generateSlug } from "~/lib/utils/slugs";
import { generateRandomId } from "~/lib/utils/generate-random-id";
import { invalidateCache, invalidateProducts } from "~/server/actions/cache";
import { arReviewedAfterSave } from "../helpers/arabic-review";

const productCopy = {
  english: ["summary", "description"],
  arabic: ["summaryAr", "descriptionAr"],
};

async function deleteProductAndInvalidate(productId: number) {
  const deleted = await data.admin.products.mutations.delete(productId);

  if (!deleted) {
    throw new AppError("Product not found", "NOT_FOUND");
  }

  await Promise.all([
    invalidateCache(`products:${productId}`),
    invalidateCache("recent-products"),
    invalidateCache("products-menu"),
    invalidateCache("sitemap"),
  ]);
  return deleted;
}

export const _products = {
  queries: {
    getPage: (input: ProductsGetPageInput) => {
      return paginate({ input, getPage: data.admin.products.queries.getPage });
    },

    getPinned: (filters: ProductsFilter) => {
      return data.admin.products.queries.getPinned(filters);
    },

    getByCategory: (categoryId: number) => {
      return data.admin.products.queries.getByCategory(categoryId);
    },

    findById: async (id: number) => {
      const product = await data.admin.products.queries.findById(id);
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },

    /** The storefront's view of a product, drafts included. */
    findSummaryBySlug: async (slug: string) => {
      const product = await data.public.products.queries.findBySlug(slug, {
        includeDrafts: true,
        locale: "en",
      });
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }

      return product;
    },

    getSalesStats: (id: number) => {
      return data.admin.products.queries.getSalesStats(id);
    },
  },

  mutations: {
    async createDeep(input: CreateProductInput) {
      const {
        options,
        variants,
        seo,
        media,
        attributeIds,
        originalCost,
        ...product
      } = input;

      const [thumbnail, ...restMedia] = media;
      if (!thumbnail?.mediaId) {
        throw new AppError("Thumbnail media ID is required", "BAD_REQUEST");
      }

      const slug = seo?.urlHandler
        ? seo.urlHandler
        : generateSlug(product.title);

      const existingProduct = await data.admin.products.queries.findBySlug(
        slug,
        { includeArchived: true },
      );

      if (existingProduct && !existingProduct.archived) {
        throw new AppError(
          "This Product already exists, please use a different title or provide a Url Handler",
          "CONFLICT",
        );
      }

      /**
       * A deleted product that is still referenced by orders is kept as an
       * archived row (see data-access `delete`), so its slug is still taken.
       * Release the slug so the new product can be created with it.
       */
      if (existingProduct?.archived) {
        await data.admin.products.mutations.update(existingProduct.id, {
          slug: `${slug}-archived-${existingProduct.id}`,
        });
      }

      const created = await data.admin.products.mutations.createDeep({
        newProduct: {
          ...product,
          profit: product.price - originalCost,
          margin: Math.ceil((product.price - originalCost) / product.price),
          slug,
          thumbnailMediaId: thumbnail.mediaId,
          arReviewed:
            arReviewedAfterSave({
              current: {},
              next: product,
              ...productCopy,
            }) ?? false,
        },
        newAttributes: attributeIds,
        newProdcutMediaIds: restMedia.map((m) => m.mediaId),
        newProductOptions: options,
        newVariants: variants?.map((v) => ({
          ...v,
          thumbnail: undefined,
          thumbnailMediaId: v.thumbnail.id,
        })),
        newSeo: seo,
        newInventoryItem: {
          quantity: product.inventory?.quantity ?? 0,
        },
      });

      await invalidateCache("recent-products");
      await invalidateCache("products-menu");
      await invalidateCache("sitemap");

      return created;
    },

    async editDeep(productId: number, input: UpdateProductInput) {
      const { options, variants, ...product } = input;

      try {
        // every write commits together or not at all
        await data.transaction(async (tx) => {
          // update the product if there are any changes
          if (Object.keys(product).length > 0) {
            const current = await data.admin.products.queries.findCopy(
              productId,
              tx,
            );
            const arReviewed =
              current &&
              arReviewedAfterSave({ current, next: product, ...productCopy });

            await data.admin.products.mutations.update(
              productId,
              {
                ...product,
                ...(arReviewed !== undefined && { arReviewed }),
                media: product.media?.map((m) => m.mediaId) ?? [],
                inventory: {
                  id: product.inventory?.id ?? 0,
                  quantity: product.inventory?.quantity ?? 0, // there's always one inventory item for a product
                },
              },
              tx,
            );
          }

          // variants and options are both required to update them both
          if (variants && options) {
            const oldVariants = await data.admin.products.queries.getVariants(
              productId,
              tx,
            );
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
                tx,
              );

            switch (variantSpace) {
              /**
               * The variants stay the same, but their stock, price or thumbnail
               * might have changed
               */
              case "NO_SPACE_CHANGE": {
                await data.admin.productVariants.mutations.updateMany(
                  this.helpers.getVariantEdits(variants),
                  tx,
                );
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
                  tx,
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
                  tx,
                );

                // the remaining variants might have been edited too
                await data.admin.productVariants.mutations.updateMany(
                  this.helpers.getVariantEdits(variants),
                  tx,
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

                await data.admin.productVariants.mutations.recreate(
                  {
                    productId,
                    variantsIds: toDelete.map((v) => v.id),
                    toInsert,
                    toUpdate,
                    valuesIdToDbId,
                  },
                  tx,
                );
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
              tx,
            );
          }

          // update the variants if there are any changes there only
          if (variants && !options) {
            await data.admin.productVariants.mutations.updateMany(
              this.helpers.getVariantEdits(variants),
              tx,
            );
          }

          /**
           * if a variant got added to a non variance product
           * delete the existing product item, and if every variant got removed
           * the product needs its own stock row back
           */
          if (variants && variants.length > 0) {
            await data.admin.inventoryItems.mutations.delete(
              productId,
              undefined,
              tx,
            );
          } else if (variants) {
            await data.admin.inventoryItems.mutations.ensureProductItem(
              productId,
              product.inventory?.quantity ?? 0,
              tx,
            );
          }
        });
      } finally {
        // invalidate once the transaction has settled, not before, or a
        // request in between caches the old data again
        await invalidateProducts([productId]);

        // invalidate the brands filter per category if a brand edit exists
        if (product.brandId) {
          await invalidateCache("category-filters");
        }
      }
    },

    /** The Arabic was checked as it stands; the storefront doesn't show the flag, so no cache to clear. */
    async markArabicReviewed(productId: number) {
      const product =
        await data.admin.products.mutations.markArabicReviewed(productId);
      if (!product) {
        throw new AppError("Product not found", "NOT_FOUND");
      }
      return product;
    },

    /** Pins a product to the top of the home page's row, or moves it there if it's already pinned. */
    async pin(productId: number) {
      const order = await data.admin.products.mutations.rewritePinned(
        (pinnedIds) => [
          productId,
          ...pinnedIds.filter((id) => id !== productId),
        ],
      );
      await invalidateCache("recent-products");
      return order;
    },

    async unpin(productId: number) {
      const order = await data.admin.products.mutations.rewritePinned(
        (pinnedIds) => pinnedIds.filter((id) => id !== productId),
      );
      await data.admin.products.mutations.rewriteStoreOrder((rankedIds) => [
        productId,
        ...rankedIds.filter((id) => id !== productId),
      ]);
      await invalidateCache("recent-products");
      return order;
    },

    /**
     * Orders the pinned products as listed. A list from a stale page can't
     * pin or unpin anything: ids that aren't pinned are dropped, and pinned
     * ones it's missing keep their order after it.
     */
    async reorderPinned(productIds: number[]) {
      const order = await data.admin.products.mutations.rewritePinned(
        (pinnedIds) => {
          const pinned = new Set(pinnedIds);
          const listed = new Set(productIds.filter((id) => pinned.has(id)));
          return [...listed, ...pinnedIds.filter((id) => !listed.has(id))];
        },
      );
      await invalidateCache("recent-products");
      return order;
    },

    /**
     * Orders the unpinned products as listed. Pinned and archived ids are
     * dropped, and ranked ones the list is missing keep their order after it.
     */
    async reorderStore(productIds: number[]) {
      const listed = new Set(productIds);
      const order = await data.admin.products.mutations.rewriteStoreOrder(
        (rankedIds) => [
          ...listed,
          ...rankedIds.filter((id) => !listed.has(id)),
        ],
      );
      await invalidateCache("recent-products");
      return order;
    },

    /**
     * Orders a category page as listed. Ids that aren't live products in the
     * category's subtree are dropped, and ordered ones the list is missing
     * keep their order after it, so a stale list can't lose a position.
     */
    async reorderCategory(categoryId: number, productIds: number[]) {
      const members = new Set(
        (await data.admin.products.queries.getByCategory(categoryId)).map(
          (product) => product.id,
        ),
      );
      return data.admin.products.mutations.rewriteCategoryOrder(
        categoryId,
        (orderedIds) => {
          const listed = new Set(productIds.filter((id) => members.has(id)));
          return [
            ...listed,
            ...orderedIds.filter((id) => members.has(id) && !listed.has(id)),
          ];
        },
      );
    },

    async delete(productId: number) {
      return deleteProductAndInvalidate(productId);
    },

    async deleteMany(productIds: number[]) {
      const deletedProducts = [];
      for (const productId of productIds) {
        deletedProducts.push(await deleteProductAndInvalidate(productId));
      }

      return deletedProducts;
    },

    helpers: {
      /**
       * The editable fields of the variants that already exist
       */
      getVariantEdits(variants: Required<UpdateProductInput>["variants"]) {
        return variants
          .filter((v) => v.id)
          .map((v) => ({
            id: v.id!,
            stock: v.stock,
            thumbnailMediaId: v.thumbnail.id,
            overridePrice: v.overridePrice ?? null,
          }));
      },

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
