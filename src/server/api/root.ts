import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { productsRouter } from "./routers/products";
import { categoriesRouter } from "./routers/categories";
import { s3Router } from "./routers/s3";
import { mediaRouter } from "./routers/media";
import { brandsRouter } from "./routers/brands";
import { listingRouter } from "./routers/listing";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  products: productsRouter,
  listing: listingRouter,
  brands: brandsRouter,
  categories: categoriesRouter,
  media: mediaRouter,
  s3: s3Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
