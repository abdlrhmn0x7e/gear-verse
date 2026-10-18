import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { RouterOutput } from "~/trpc/client";

type SubCategory = Pick<
  RouterOutput["public"]["categories"]["queries"]["findAll"][number],
  "name" | "slug"
>;

/**
 * Sub categories are separate pages (each has its own attributes and brands),
 * so narrowing by a sub category navigates to that category's page.
 */
export function SubCategoryFilterItem({ category }: { category: SubCategory }) {
  return (
    <Button
      variant="outline"
      nativeButton={false}
      render={<Link href={`/categories/${category.slug}`} />}
    >
      {category.name}
      <ArrowUpRightIcon data-icon="inline-end" aria-hidden />
    </Button>
  );
}
