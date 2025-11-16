import { useMemo } from "react";
import type { CategoryTree } from "~/lib/schemas/entities/category";
import type { CategoryIconEnum } from "~/lib/schemas/entities/category";
import type { Category } from "~/lib/schemas/entities/category";

type FlattenCategoriesInput = {
  categories: CategoryTree[];
  parentPath?: { icon: CategoryIconEnum; name: string }[];
  flat?: Array<
    Omit<Category, "updated_at"> & {
      path: { icon: CategoryIconEnum; name: string }[];
    }
  >;
};

export function useFlatCategories(rootCategories: CategoryTree[]) {
  return useMemo(() => {
    const flatten = ({
      categories,
      parentPath = [],
      flat = [],
    }: FlattenCategoriesInput) => {
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
          flatten({
            categories: children,
            parentPath: [...parentPath, currentItem],
            flat,
          });
        }
      }

      return flat;
    };

    return flatten({ categories: rootCategories });
  }, [rootCategories]);
}
