import { createTRPCRouter } from "../../trpc";
import { productsRouter } from "./products";
import { brandsRouter } from "./brands";
import { categoriesRouter } from "./categories";
import { mediaRouter } from "./media";
import { s3Router } from "./s3";
import { adminOrdersRouter } from "./orders";

export const adminRouter = createTRPCRouter({
  products: productsRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
  media: mediaRouter,
  s3: s3Router,
  orders: adminOrdersRouter,
});
