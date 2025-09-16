import { createTRPCRouter } from "../../trpc";
import { productsRouter } from "./products";
import { brandsRouter } from "./brands";
import { categoriesRouter } from "./categories";

export const userRouter = createTRPCRouter({
  products: productsRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
});
