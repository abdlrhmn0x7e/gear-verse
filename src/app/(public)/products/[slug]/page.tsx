import notFound from "~/app/admin/not-found";
import { api } from "~/trpc/server";
import { Product } from "./_components/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Reviews } from "./_components/reviews";
import { InfoIcon, MessageCircleIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { ProductDescription } from "~/components/product-description";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await api.public.products.queries.findBySlug({ slug });
  if (!product) {
    return notFound();
  }

  return (
    <section className="py-24">
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
            <div className="space-y-4">
              <Heading level={2}>Description</Heading>

              <ProductDescription
                description={product.description}
                className="m-0"
              />
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Reviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </Product>
    </section>
  );
}
