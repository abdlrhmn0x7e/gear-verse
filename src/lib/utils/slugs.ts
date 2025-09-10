import slugify from "slugify";

export function generateSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
  });
}
