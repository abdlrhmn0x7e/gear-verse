import { notFound } from "next/navigation";
import { api } from "~/trpc/server";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (isNaN(parseInt(id))) {
    return notFound();
  }

  const product = await api.products.findById({ id: parseInt(id) });
  if (!product) {
    return notFound();
  }

  return <code>{JSON.stringify(product, null, 2)}</code>;
}
