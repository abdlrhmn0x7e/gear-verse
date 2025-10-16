import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Heading } from "~/components/heading";
import { SparklesIcon } from "lucide-react";
import { CheckoutFormSkeleton } from "./_components/checkout-form";

export default function CheckoutLoading() {
  return (
    <section>
      <MaxWidthWrapper className="grid min-h-screen grid-cols-1 gap-6 py-24 xl:grid-cols-3 xl:py-32">
        {/* Left Side - Form and Mobile Order Summary */}
        <div className="space-y-4 xl:col-span-2">
          <div className="flex items-center gap-2">
            <SparklesIcon className="mb-1 size-6" />

            <Heading level={3} font="default" className="text-lg md:text-xl">
              Gear Verse
            </Heading>
          </div>
          {/* Checkout Form Skeleton */}
          <div className="space-y-4">
            <Heading level={2}>Your Details</Heading>
            {/* Payment Method Section */}

            <CheckoutFormSkeleton />
          </div>

          {/* Mobile Order Summary */}
          <div className="space-y-3 lg:hidden">
            <Heading level={4}>Order Summary</Heading>

            {[0, 1].map((index) => (
              <div className="flex gap-3" key={index}>
                <Skeleton className="size-24 shrink-0 rounded-md" />
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Desktop Order Summary */}
        <div className="hidden lg:block">
          <Card className="h-fit space-y-3">
            <CardHeader>
              <CardTitle className="text-xl">
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="overflow-hidden rounded-lg">
                    <AspectRatio ratio={16 / 10}>
                      <Skeleton className="size-full" />
                    </AspectRatio>
                  </div>
                ))}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>

              <Separator />

              {/* Final Total */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
