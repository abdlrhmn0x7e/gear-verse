import { _userProductsRepository } from "./products";
import { _userBrandsRepository } from "./brands";
import { _userCategoriesRepository } from "./categories";
import { _userCartsRepository } from "./carts";
import { _userProductVariantsRepository } from "./product-variants";
import { _userOrdersRepository } from "./orders";
import { _userAddressesRepository } from "./addresses";
import { _userReviewsRepository } from "./reviews";

export const _userRepositories = {
  products: _userProductsRepository,
  brands: _userBrandsRepository,
  categories: _userCategoriesRepository,
  carts: _userCartsRepository,
  productVariants: _userProductVariantsRepository,
  orders: _userOrdersRepository,
  addresses: _userAddressesRepository,
  reviews: _userReviewsRepository,
};
