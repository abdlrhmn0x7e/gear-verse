import { _products } from "./products";
import { _brands } from "./brands";
import { _carts } from "./carts";
import { _categories } from "./categories";
import { _reviews } from "./reviews";
import { _checkout } from "./check-out";
import { _orders } from "./orders";
import { _customers } from "./customers";

export const _public = {
  products: _products,
  categories: _categories,
  brands: _brands,
  carts: _carts,
  reviews: _reviews,
  checkout: _checkout,
  orders: _orders,
  customers: _customers,
};
