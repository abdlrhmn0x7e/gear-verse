import { StarIcon } from "lucide-react";
import type { TestimonialItem } from "~/components/features/testimonials/testimonials";
import {
  ProductRow,
  ProductRowItem,
} from "~/components/features/products/product-row";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { cn } from "~/lib/utils";
import { SectionHeader } from "./section-header";

export function Testimonials({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="testimonials-heading">
      <MaxWidthWrapper className="space-y-12">
        <SectionHeader
          id="testimonials-heading"
          title="What customers say"
          description="Real customers, in their own words."
        />

        {/* a swipeable row on phones, where nine stacked cards ran about 2,000px */}
        <ProductRow className="md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((testimonial) => (
            <ProductRowItem
              key={testimonial.name}
              className="bg-card flex flex-col gap-5 rounded-3xl p-6"
            >
              <div
                className="flex gap-0.5"
                role="img"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={index}
                    aria-hidden
                    className={cn(
                      "size-4",
                      index < testimonial.rating
                        ? "fill-foreground text-foreground"
                        : "text-muted-foreground",
                    )}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <blockquote
                lang="ar"
                dir="rtl"
                className="text-body-lg leading-relaxed text-pretty"
              >
                {testimonial.content}
              </blockquote>
              <p className="text-muted-foreground mt-auto text-sm">
                {testimonial.name}
              </p>
            </ProductRowItem>
          ))}
        </ProductRow>
      </MaxWidthWrapper>
    </section>
  );
}
