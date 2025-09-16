import { _userProductsRepository } from "./products";
import { _userBrandsRepository } from "./brands";
import { _userCategoriesRepository } from "./categories";

export const _userRepositories = {
  products: _userProductsRepository,
  brands: _userBrandsRepository,
  categories: _userCategoriesRepository,
};
