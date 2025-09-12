import { _brandsRepository } from "./brands";
import { _categoriesRepository } from "./categories";
import { _mediaRepository } from "./media";
import { _productVariantsRepository } from "./product-variants";
import { _productsRepository } from "./products";

export const DB = {
  products: _productsRepository,
  productVariants: _productVariantsRepository,
  brands: _brandsRepository,
  categories: _categoriesRepository,
  media: _mediaRepository,
};
