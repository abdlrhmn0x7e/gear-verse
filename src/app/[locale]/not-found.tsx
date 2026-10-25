import { NotFoundContent } from "~/components/not-found-content";

/** Unknown first segments, such as /missing.txt. Storefront 404s render inside its layout, with the navbar. */
export default function LocaleNotFound() {
  return <NotFoundContent />;
}
