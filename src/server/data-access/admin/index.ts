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
import { _carts } from "./carts";
import { _inventoryItems } from "./inventory-items";
import { _attributes } from "./attributes";

export const _admin = {
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
  carts: _carts,
  inventoryItems: _inventoryItems,
  attributes: _attributes,
};
