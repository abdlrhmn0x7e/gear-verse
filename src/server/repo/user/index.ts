import { _userProductsRepo } from "./products";
import { _userBrandsRepo } from "./brands";
import { _userCategoriesRepo } from "./categories";
import { _userCartsRepo } from "./carts";
import { _userVariantsRepo } from "./variants";
import { _userOrdersRepo } from "./orders";
import { _userAddressesRepo } from "./addresses";
import { _userReviewsRepo } from "./reviews";

export const _userRepo = {
  products: _userProductsRepo,
  brands: _userBrandsRepo,
  categories: _userCategoriesRepo,
  carts: _userCartsRepo,
  productVariants: _userVariantsRepo,
  orders: _userOrdersRepo,
  addresses: _userAddressesRepo,
  reviews: _userReviewsRepo,
};
