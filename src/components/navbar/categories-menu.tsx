/** eslint-disable react-hooks/static-components */
import { app } from "~/server/application";
import { Card, CardContent } from "../ui/card";
import type { RouterOutput } from "~/trpc/client";
import { iconsMap } from "~/lib/icons-map";
import { IconCategory } from "@tabler/icons-react";
import { NavLink } from "./nav";
import Header from "../header";
import { Heading } from "../heading";

export async function CategoriesMenu() {
  const categories = await app.public.categories.queries.findAll({
    filters: { root: true },
  });

  return (
    <div className="space-y-3 pb-12">
      <Header
        title="Categories"
        description="Browse product categories"
        Icon={IconCategory}
        headingLevel={4}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
}: {
  category: RouterOutput["public"]["categories"]["queries"]["findAll"][number];
}) {
  const CategoryIcon = iconsMap.get(category.icon) ?? IconCategory;

  return (
    <NavLink href={`/categories/${category.slug}`}>
      <Card className="ring-accent transition-shadow hover:ring-2">
        <CardContent className="flex flex-col items-center gap-2 text-center">
          {/* eslint-disable-next-line react-hooks/static-components*/}
          <CategoryIcon />
          <Heading level={4}>{category.name}</Heading>
        </CardContent>
      </Card>
    </NavLink>
  );
}
