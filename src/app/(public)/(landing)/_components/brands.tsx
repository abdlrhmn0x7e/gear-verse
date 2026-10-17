import Link from "next/link";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { getBrands } from "../_lib/queries";
import { SectionHeader } from "./section-header";

export async function Brands() {
  const brands = await getBrands();
  if (brands.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="brands-heading">
      <MaxWidthWrapper className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <SectionHeader
          id="brands-heading"
          title="Brands we import"
          description="Tap a brand to see everything we carry from it."
        />

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/products?brands=${brand.slug}`}
                className="group flex flex-col items-center gap-3 rounded-3xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
              >
                <div className="image-well aspect-square w-full overflow-hidden rounded-3xl">
                  <ImageWithFallback
                    src={brand.logo}
                    alt=""
                    width={320}
                    height={320}
                    sizes="(min-width: 1024px) 18vw, 50vw"
                    className="size-full rounded-none border-none bg-transparent p-[22%] transition-[scale] duration-300 ease-out motion-safe:group-hover:scale-[1.04] [&_img]:object-contain"
                  />
                </div>
                <span className="text-sm font-medium">{brand.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
