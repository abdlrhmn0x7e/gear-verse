import { _adminBrandsRepo } from "./brands";
import { _adminCategoriesRepo } from "./categories";
import { _adminMediaRepo } from "./media";
import { _adminOrdersRepo } from "./orders";
import { _adminVariantsRepo } from "./product-variants";
import { _adminProductsRepo } from "./products";
import { _adminUsersRepo } from "./users";
import { _adminAddressesRepo } from "./addresses";

export const _adminRepo = {
  products: _adminProductsRepo,
  productVariants: _adminVariantsRepo,
  brands: _adminBrandsRepo,
  categories: _adminCategoriesRepo,
  media: _adminMediaRepo,
  orders: _adminOrdersRepo,
  addresses: _adminAddressesRepo,
  users: _adminUsersRepo,
};
