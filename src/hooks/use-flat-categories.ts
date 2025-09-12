import { useCallback, useMemo } from "react";
import type { CategoryTree } from "~/lib/schemas/category";
import type { CategoryIconEnum } from "~/lib/schemas/category";
import type { Category } from "~/lib/schemas/category";

export function useFlatCategories(categories: CategoryTree[]) {
  const flattenCategories = useCallback(
    (
      categories: CategoryTree[],
      parentPath: { icon: CategoryIconEnum; name: string }[] = [],
      flat: Array<
        Category & { path: { icon: CategoryIconEnum; name: string }[] }
      > = [],
    ) => {
      for (const category of categories) {
        const { children, ...item } = category;
        const currentItem = {
          icon: item.icon,
          name: item.name,
        };
        flat.push({
          ...item,
          path: [...parentPath, currentItem],
        });

        if (children) {
          flattenCategories(children, [...parentPath, currentItem], flat);
        }
      }

      return flat;
    },
    [],
  );

  const flatCategories = useMemo(() => {
    return flattenCategories(categories);
  }, [categories, flattenCategories]);

  return flatCategories;
}
