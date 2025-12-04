import { Card, CardContent } from "~/components/ui/card";
import { Filters } from "./_components/filters";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Suspense } from "react";
import { Products, ProductsSkeleton } from "./_components/products";
import { loadFilterSearchParams } from "./_components/utils";
import { app } from "~/server/application";
import type { SearchParams } from "nuqs/server";

export async function generateStaticParams() {
  const slugs = await app.public.categories.queries.findAllSlugs();
  return slugs;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const loadedSps = loadFilterSearchParams(sp as Record<string, string>);

  return (
    <MaxWidthWrapper className="relative grid min-h-screen grid-cols-1 gap-8 py-16 pt-24 lg:grid-cols-12 lg:pt-32">
      <aside className="sticky top-24 hidden h-fit lg:col-span-4 lg:block xl:col-span-3">
        <Card className="h-fit max-h-full p-4">
          <CardContent className="p-0 pb-4">
            <ScrollArea className="pr-4">
              <Filters slug={slug} />
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      <Suspense
        fallback={<ProductsSkeleton className="lg:col-span-8 xl:col-span-9" />}
      >
        <Products
          className="lg:col-span-8 xl:col-span-9"
          filters={loadedSps}
          slug={slug}
        />
      </Suspense>
    </MaxWidthWrapper>
  );
}
