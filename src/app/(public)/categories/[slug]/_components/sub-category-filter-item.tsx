import { ChevronRightIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/trpc/client";

type SubCategory = Pick<
  RouterOutput["public"]["categories"]["queries"]["findAll"][number],
  "name" | "slug" | "icon"
>;

/**
 * Sub categories are separate pages (each has its own attributes and brands),
 * so narrowing by a sub category navigates to that category's page.
 */
export function SubCategoryFilterItem({
  category,
  isMobile = false,
}: {
  category: SubCategory;
  isMobile?: boolean;
}) {
  const Icon = iconsMap.get(category.icon) ?? FolderIcon;

  return (
    <Button
      variant="outline"
      size={isMobile ? "sm" : "default"}
      className={cn(!isMobile && "w-full justify-start")}
      asChild
    >
      <Link href={`/categories/${category.slug}`}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="size-4" />
        <span className="flex-1 truncate text-left">{category.name}</span>
        {!isMobile && (
          <ChevronRightIcon className="text-muted-foreground size-4" />
        )}
      </Link>
    </Button>
  );
}
