import { env } from "~/env";

export const CART_COOKIE_NAME =
  env.NODE_ENV === "production"
    ? "__Secure-gear-verse.cartId"
    : "gear-verse.cartId";
