import { _brands } from "./brands";
import { _categories } from "./categories";
import { _media } from "./media";
import { _orders } from "./orders";
import { _productVariants } from "./product-variants";
import { _products } from "./products";
import { _users } from "./users";
import { _addresses } from "./addresses";
import { _options } from "./options";
import { _optionValues } from "./option-values";

export const _adminRepo = {
  products: _products,
  productVariants: _productVariants,
  productOptions: _options,
  productOptionValues: _optionValues,
  brands: _brands,
  categories: _categories,
  media: _media,
  orders: _orders,
  addresses: _addresses,
  users: _users,
};
