import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { cn } from "~/lib/utils";
import { getCategoryCovers } from "../_lib/queries";
import { SectionHeader } from "./section-header";

type TileLayout = "lead" | "wide" | "compact";

/** The first category leads once there are three or more; the rest fill a 4-column bento. */
function tileLayout(index: number, count: number): TileLayout {
  if (count <= 2) return "wide";
  if (index === 0) return "lead";
  if (count === 3 || (count === 4 && index === 1)) return "wide";
  return "compact";
}

const tileClassName: Record<TileLayout, string> = {
  lead: "col-span-2 lg:row-span-2",
  wide: "col-span-2",
  compact: "col-span-1",
};

export async function CategoryBento() {
  const covers = await getCategoryCovers();
  if (covers.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="categories-heading">
      <MaxWidthWrapper className="space-y-12">
        <SectionHeader
          id="categories-heading"
          title="Shop by category"
          description="Find your next upgrade, from audio to input."
        />

        <ul
          className={cn(
            "grid grid-cols-2 gap-4 md:gap-6",
            covers.length === 1 ? "lg:grid-cols-2" : "lg:grid-cols-4",
          )}
        >
          {covers.map(({ category, product }, index) => {
            const layout = tileLayout(index, covers.length);
            return (
              <li key={category.slug} className={tileClassName[layout]}>
                <Link
                  href={`/categories/${category.slug}`}
                  className={cn(
                    "bg-card group focus-visible:outline-focus flex size-full flex-col gap-4 rounded-3xl p-4 transition-[scale,opacity] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:active:scale-[0.98] motion-reduce:active:opacity-70 md:p-5",
                    layout === "wide" && "sm:flex-row sm:items-stretch",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start justify-between gap-4 p-2",
                      layout === "wide" &&
                        "sm:w-2/5 sm:flex-col sm:justify-between sm:p-4",
                    )}
                  >
                    <h3
                      className={cn(
                        "text-balance",
                        layout === "lead" ? "text-headline-sm" : "text-title",
                      )}
                    >
                      {category.name}
                    </h3>
                    <span className="surface-control flex size-10 shrink-0 items-center justify-center rounded-full">
                      <ArrowRightIcon
                        className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </div>

                  <div
                    className={cn(
                      "image-well relative flex-1 overflow-hidden rounded-2xl",
                      layout === "lead" && "aspect-square lg:aspect-auto",
                      layout === "wide" && "aspect-[4/3]",
                      layout === "compact" && "aspect-square",
                    )}
                  >
                    <ImageWithFallback
                      src={product.thumbnailUrl}
                      alt=""
                      width={800}
                      height={800}
                      sizes={
                        layout === "compact"
                          ? "(min-width: 1024px) 25vw, 50vw"
                          : "(min-width: 1024px) 40vw, 100vw"
                      }
                      className="absolute inset-0 size-full rounded-none border-none bg-transparent p-6 transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-[1.04] md:p-10 [&_img]:object-contain"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
