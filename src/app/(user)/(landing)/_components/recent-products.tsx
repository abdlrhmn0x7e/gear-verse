import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { api } from "~/trpc/server";

export async function RecentProducts() {
  const products = await api.user.products.getPage({
    pageSize: 10,
  });
  console.log(products);

  return (
    <section className="bg-accent py-24">
      <MaxWidthWrapper>
        <div>
          <Heading level={1}>Our Latest Rare Gear Collection</Heading>
          <p className="text-muted-foreground text-lg">
            {
              "Gaming gear choices are limited in Egypt. We're here to change that. Take a look at our latest collection."
            }
          </p>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
