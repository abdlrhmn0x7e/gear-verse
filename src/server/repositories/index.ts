import { _brandsRepository } from "./brands";
import { _categoriesRepository } from "./categories";
import { _mediaRepository } from "./media";
import { _productsRepository } from "./products";

export const DB = {
  categories: _categoriesRepository,
  media: _mediaRepository,
  products: _productsRepository,
  brands: _brandsRepository,
};
