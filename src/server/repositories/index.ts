import { _brandsRepository } from "./admin/brands";
import { _categoriesRepository } from "./admin/categories";
import { _mediaRepository } from "./admin/media";
import { _productVariantsRepository } from "./admin/product-variants";
import { _productsRepository } from "./admin/products";

export const DB = {
  admin: {
    products: _productsRepository,
    productVariants: _productVariantsRepository,
    brands: _brandsRepository,
    categories: _categoriesRepository,
    media: _mediaRepository,
  },
};
