import { api } from "~/trpc/server";
import { Filters } from "./_components/filters";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export default async function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;

  return (
    <section className="py-12">
      <MaxWidthWrapper className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-4">
        <Filters slug={slug} />
      </MaxWidthWrapper>
    </section>
  );
}
