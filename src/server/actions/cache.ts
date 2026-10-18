import { revalidateTag } from "next/cache";
import "server-only";

/**
 * Server side only on purpose: this used to be a server action, which let
 * anyone clear any cache tag from the browser.
 */
export async function invalidateCache(key: string) {
  revalidateTag(key, "max");
}
