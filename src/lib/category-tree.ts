import { cacheTag } from "next/cache";
import type { CategoryTree } from "~/lib/schemas/entities/category";
import { app } from "~/server/application";

export async function getCategoryTree() {
  "use cache";

  cacheTag("categories-menu");

  return app.public.categories.queries.findAll(undefined);
}

/** Root-to-node path of the first category matching `match`, or an empty array. */
export function findCategoryPath(
  nodes: CategoryTree[],
  match: (node: CategoryTree) => boolean,
): CategoryTree[] {
  for (const node of nodes) {
    if (match(node)) return [node];
    const rest = findCategoryPath(node.children ?? [], match);
    if (rest.length > 0) return [node, ...rest];
  }
  return [];
}
