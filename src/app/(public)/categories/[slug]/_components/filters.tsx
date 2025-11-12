import { Heading } from "~/components/heading";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/server";

export async function Filters({ slug }: { slug: string }) {
  const categories = await api.public.categories.queries.getSubCategories({
    slug,
  });

  return (
    <aside id="filters" className="hidden lg:block">
      <Card className="p-4">
        <CardContent className="p-0 pb-4">
          <div className="flex flex-col gap-6 divide-y [&>*:not(:last-child)]:pb-8">
            {categories.length > 0 &&
              categories.map((category) => (
                <div className="flex flex-col gap-4">
                  <Heading level={4}>{category.name}</Heading>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
