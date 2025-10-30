import { createTRPCRouter } from "~/server/api/init";
import { productsRouter } from "./products";
import { brandsRouter } from "./brands";
import { categoriesRouter } from "./categories";
import { mediaRouter } from "./media";
import { s3Router } from "./s3";
import { adminOrdersRouter } from "./orders";
import { inventoryItemsRouter } from "./inventory-items";
import { productVariantsRouter } from "./product-variants";
import { usersRouter } from "./users";

export const adminRouter = createTRPCRouter({
  products: productsRouter,
  productVariants: productVariantsRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
  media: mediaRouter,
  s3: s3Router,
  orders: adminOrdersRouter,
  inventoryItems: inventoryItemsRouter,
  users: usersRouter,
});
