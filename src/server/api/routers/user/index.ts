import { createTRPCRouter } from "../../trpc";
import { userProductsRouter } from "./products";
import { userBrandsRouter } from "./brands";
import { userCategoriesRouter } from "./categories";
import { userCartsRouter } from "./carts";
import { userCheckoutRouter } from "./checkout";
import { userOrdersRouter } from "./orders";

export const userRouter = createTRPCRouter({
  products: userProductsRouter,
  brands: userBrandsRouter,
  categories: userCategoriesRouter,
  carts: userCartsRouter,
  checkout: userCheckoutRouter,
  orders: userOrdersRouter,
});
