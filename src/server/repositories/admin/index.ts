import { _adminBrandsRepository } from "./brands";
import { _adminCategoriesRepository } from "./categories";
import { _adminMediaRepository } from "./media";
import { _adminOrdersRepository } from "./orders";
import { _adminProductVariantsRepository } from "./product-variants";
import { _adminProductsRepository } from "./products";
import { _adminUsersRepository } from "./users";
import { _adminAddressesRepository } from "./addresses";

export const _adminRepositories = {
  products: _adminProductsRepository,
  productVariants: _adminProductVariantsRepository,
  brands: _adminBrandsRepository,
  categories: _adminCategoriesRepository,
  media: _adminMediaRepository,
  orders: _adminOrdersRepository,
  addresses: _adminAddressesRepository,
  users: _adminUsersRepository,
};
