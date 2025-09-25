import notFound from "~/app/admin/not-found";
import { api } from "~/trpc/server";
import { Product } from "./_components/product";
import { ProductDetails } from "./_components/product-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Reviews } from "./_components/reviews";
import { InfoIcon, MessageCircleIcon } from "lucide-react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await api.public.products.findBySlug({ slug });
  if (!product) {
    return notFound();
  }

  return (
    <Product product={product}>
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="details">
            <InfoIcon />
            Details
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageCircleIcon />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ProductDetails product={product} />
        </TabsContent>

        <TabsContent value="reviews">
          <Reviews productId={product.id} />
        </TabsContent>
      </Tabs>
    </Product>
  );
}
