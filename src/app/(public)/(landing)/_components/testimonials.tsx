import { StarIcon } from "lucide-react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { cn } from "~/lib/utils";
import { SectionHeader } from "./section-header";

export type TestimonialItem = {
  name: string;
  rating: number;
  content: string;
};

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

        <ul className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.name}
              className="bg-card mb-4 flex break-inside-avoid flex-col gap-5 rounded-3xl p-6 md:mb-6"
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
              <p className="text-muted-foreground text-sm">
                {testimonial.name}
              </p>
            </li>
          ))}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
