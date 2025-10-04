import { _adminBrandsRepo } from "./brands";
import { _adminCategoriesRepo } from "./categories";
import { _adminMediaRepo } from "./media";
import { _adminOrdersRepo } from "./orders";
import { _adminProductVariants } from "./product-variants";
import { _adminProducts } from "./products";
import { _adminUsers } from "./users";
import { _adminAddressesRepo } from "./addresses";
import { _adminOptions } from "./options";
import { _adminOptionValuesRepo } from "./option-values";

export const _adminRepo = {
  products: _adminProducts,
  productVariants: _adminProductVariants,
  productOptions: _adminOptions,
  productOptionValues: _adminOptionValuesRepo,
  brands: _adminBrandsRepo,
  categories: _adminCategoriesRepo,
  media: _adminMediaRepo,
  orders: _adminOrdersRepo,
  addresses: _adminAddressesRepo,
  users: _adminUsers,
};
