import { _adminBrandsRepository } from "./brands";
import { _adminCategoriesRepository } from "./categories";
import { _adminMediaRepository } from "./media";
import { _adminProductVariantsRepository } from "./product-variants";
import { _adminProductsRepository } from "./products";

export const _adminRepositories = {
  products: _adminProductsRepository,
  productVariants: _adminProductVariantsRepository,
  brands: _adminBrandsRepository,
  categories: _adminCategoriesRepository,
  media: _adminMediaRepository,
};
