import { _brandsRepository } from "./brands";
import { _categoriesRepository } from "./categories";
import { _listingsRepository } from "./listings";
import { _mediaRepository } from "./media";
import { _productsRepository } from "./products";

export const DB = {
  products: _productsRepository,
  listings: _listingsRepository,
  brands: _brandsRepository,
  categories: _categoriesRepository,
  media: _mediaRepository,
};
