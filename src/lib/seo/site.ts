import { env } from "~/env";

export const SITE_NAME = "Gear Verse";
export const SITE_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${SITE_URL}/`).toString();
}
