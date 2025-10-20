import { _products } from "./products";
import { _media } from "./media";
import { _brands } from "./brands";
import { _categories } from "./categories";
import { _orders } from "./orders";
import { _inventoryItems } from "./inventory-items";
import { _productVariants } from "./product-variants";

export const _admin = {
  products: _products,
  productVariants: _productVariants,
  media: _media,
  brands: _brands,
  categories: _categories,
  orders: _orders,
  inventoryItems: _inventoryItems,
};
