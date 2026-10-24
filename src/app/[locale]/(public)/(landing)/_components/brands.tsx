import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { getBrands } from "../_lib/queries";
import { SectionHeader } from "./section-header";

export async function Brands() {
  const [brands, t, tCommon] = await Promise.all([
    getBrands(),
    getTranslations("landing.brands"),
    getTranslations("common"),
  ]);
  if (brands.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="brands-heading">
      <MaxWidthWrapper className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <SectionHeader
          id="brands-heading"
          title={t("title")}
          description={t("description")}
        />

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/products?brands=${brand.slug}`}
                className="group focus-visible:outline-focus flex flex-col items-center gap-3 rounded-3xl transition-[scale,opacity] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:active:scale-[0.98] motion-reduce:active:opacity-70"
              >
                <div className="image-well aspect-square w-full overflow-hidden rounded-3xl">
                  <ImageWithFallback
                    src={brand.logo}
                    alt=""
                    errorLabel={tCommon("imageError")}
                    width={320}
                    height={320}
                    sizes="(min-width: 1024px) 18vw, 50vw"
                    className="size-full rounded-none border-none bg-transparent p-[22%] transition-[scale] duration-300 ease-out motion-safe:group-hover:scale-[1.04] [&_img]:object-contain"
                  />
                </div>
                <bdi className="text-sm font-medium">{brand.name}</bdi>
              </Link>
            </li>
          ))}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
