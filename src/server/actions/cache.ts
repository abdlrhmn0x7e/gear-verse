"use server";

import { revalidateTag } from "next/cache";
import "server-only";

export async function invalidateCache(key: string) {
  revalidateTag(key, "max");
}
