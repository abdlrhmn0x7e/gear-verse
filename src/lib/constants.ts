import { env } from "~/env";

export const CART_COOKIE_NAME =
  env.NODE_ENV === "production"
    ? "__Secure-gear-verse.cartId"
    : "gear-verse.cartId";

export const ADDRESSES_COOKIE_NAME =
  env.NODE_ENV === "production"
    ? "__Secure-gear-verse.addresses"
    : "gear-verse.addresses";
