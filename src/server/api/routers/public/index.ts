import { createTRPCRouter } from "../../trpc";
import { userProductsRouter } from "./products";
import { userBrandsRouter } from "./brands";
import { userCategoriesRouter } from "./categories";
import { userCartsRouter } from "./carts";
import { userCheckoutRouter } from "./checkout";
import { userOrdersRouter } from "./orders";
import { userReviewsRouter } from "./reviews";
import { userCustomersRouter } from "./customers";

export const publicRouter = createTRPCRouter({
  products: userProductsRouter,
  brands: userBrandsRouter,
  categories: userCategoriesRouter,
  carts: userCartsRouter,
  checkout: userCheckoutRouter,
  orders: userOrdersRouter,
  reviews: userReviewsRouter,
  customers: userCustomersRouter,
});
