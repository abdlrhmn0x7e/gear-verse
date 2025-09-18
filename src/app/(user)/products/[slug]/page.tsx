import notFound from "~/app/admin/not-found";
import { api } from "~/trpc/server";
import { Product } from "./_components/product";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await api.user.products.findBySlug({ slug });
  if (!product) {
    return notFound();
  }

  return <Product product={product} />;
}
