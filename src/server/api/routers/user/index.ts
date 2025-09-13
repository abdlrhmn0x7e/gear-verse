import { createTRPCRouter } from "../../trpc";
import { productsRouter } from "./products";
import { brandsRouter } from "./brands";

export const userRouter = createTRPCRouter({
  products: productsRouter,
  brands: brandsRouter,
});
