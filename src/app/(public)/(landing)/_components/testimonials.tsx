"use client";

import { StarIcon } from "lucide-react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import autoScroll from "embla-carousel-auto-scroll";

export type TestimonialItem = {
  name: string;
  avatar: string;
  rating: number;
  content: string;
};

type TestimonialsProps = {
  testimonials: TestimonialItem[];
};

const Testimonials = ({ testimonials }: TestimonialsProps) => {
  return (
    <section className="py-8 sm:py-16 lg:py-24">
      <MaxWidthWrapper>
        <Carousel
          className="flex gap-12 px-4 max-sm:flex-col sm:items-center sm:gap-16 sm:px-6 lg:gap-24 lg:px-8"
          opts={{
            align: "start",
            slidesToScroll: 1,
            loop: true,
          }}
          plugins={[
            autoScroll({
              direction: "backward",
              playOnInit: true,
              stopOnInteraction: true,
            }),
          ]}
        >
          {/* Left Content */}
          <div className="space-y-4 sm:w-1/2 lg:w-1/3">
            <p className="text-primary text-sm font-semibold uppercase">
              Real customers
            </p>

            <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
              Customers Feedback
            </h2>

            <p className="text-muted-foreground text-xl">
              From career changes to dream jobs, here&apos;s how Shadcn Studio
              helped.
            </p>

            <div className="flex items-center gap-4">
              <CarouselPrevious
                variant="default"
                className="disabled:bg-primary/10 disabled:text-primary static translate-y-0 rounded-md disabled:opacity-100"
              />
              <CarouselNext
                variant="default"
                className="disabled:bg-primary/10 disabled:text-primary static translate-y-0 rounded-md disabled:opacity-100"
              />
            </div>
          </div>

          {/* Right Testimonial Carousel */}
          <div className="relative max-w-196 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] select-none sm:w-1/2 lg:w-2/3">
            <CarouselContent className="sm:mr-5 sm:ml-3">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="sm:pl-6 lg:basis-2/3"
                  dir="rtl"
                >
                  <Card className="hover:border-primary h-full transition-colors duration-300">
                    <CardContent className="space-y-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-full">
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={testimonial.name}
                          />
                          <AvatarFallback className="rounded-full text-sm">
                            {testimonial.name
                              .split(" ", 2)
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h4 className="font-medium">{testimonial.name}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 - testimonial.rating }).map(
                          (_, index) => (
                            <StarIcon
                              key={index}
                              className="size-4 fill-current text-gray-300"
                            />
                          ),
                        )}
                        {Array.from({ length: testimonial.rating }).map(
                          (_, index) => (
                            <StarIcon
                              key={index}
                              className="size-4 fill-current text-yellow-400"
                            />
                          ),
                        )}
                      </div>
                      <p>{testimonial.content}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </MaxWidthWrapper>
    </section>
  );
};

export default Testimonials;
