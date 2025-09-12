import { createTRPCRouter } from "../../trpc";
import { productsRouter } from "./products";
import { brandsRouter } from "./brands";
import { productVariantsRouter } from "./product-variants";
import { categoriesRouter } from "./categories";
import { mediaRouter } from "./media";
import { s3Router } from "./s3";

export const adminRouter = createTRPCRouter({
  products: productsRouter,
  productVariants: productVariantsRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
  media: mediaRouter,
  s3: s3Router,
});
