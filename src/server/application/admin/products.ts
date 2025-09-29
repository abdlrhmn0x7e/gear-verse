import { AppError } from "~/lib/errors/app-error";
import { data } from "~/server/data-access";
import type { CreateProductInput } from "@schemas/entities";
import type { ProductsGetPageInput } from "@schemas/contracts";
import { paginate } from "~/server/application/helpers/pagination";
import { generateSlug } from "~/lib/utils/slugs";

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
    createDeep: (input: CreateProductInput) => {
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
  },
};
