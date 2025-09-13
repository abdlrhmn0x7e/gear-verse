import { createTRPCRouter } from "../../trpc";
import { productsRouter } from "./products";

export const userRouter = createTRPCRouter({
  products: productsRouter,
});
