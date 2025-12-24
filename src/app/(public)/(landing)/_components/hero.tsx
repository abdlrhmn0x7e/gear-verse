import { IconKeyboard, IconMouse2 } from "@tabler/icons-react";
import {
  CheckCircle2Icon,
  Gamepad2Icon,
  HeadphonesIcon,
  PackageIcon,
  Sparkle,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Orbit } from "~/components/orbit";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { app } from "~/server/application";

const FEATURES = [
  "Customs Cleared & Insured",
  "Rare Gear From Around the World",
  "Fast & Reliable Delivery",
  "100% Satisfaction Guarantee",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-background relative min-h-screen w-full">
        {/* Pink Glow Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(125%_125%_at_50%_90%,var(--background)_40%,var(--primary)_200%)] bg-size-[100%_100%]" />
        <MaxWidthWrapper className="relative z-10 flex h-screen flex-col items-center justify-center py-32">
          <div className="grid h-full grid-cols-1 items-center lg:grid-cols-2">
            <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <Badge>
                <Sparkles />
                {"For Egyptian Gamers Tired of the limited options"}
              </Badge>

              <div className="space-y-3">
                <Heading
                  level={1}
                  font="default"
                  className="text-accent-foreground relative text-pretty"
                >
                  The World&apos;s Best Gear{" "}
                  <span className="relative inline-block">
                    <Sparkles className="animate-twinkle absolute -top-1 -right-2 size-4 lg:top-0" />
                    Finally
                  </span>{" "}
                  in Egypt.
                </Heading>
                <p className="text-muted-foreground max-w-xl text-base lg:text-lg">
                  We&apos;re gamers who got tired of the system. So we built the
                  solution: A curated store of the best international brands,
                  fully cleared and delivered fast, so you never have to worry
                  about fakes or shipping nightmares again.
                </p>
              </div>

              <ul className="hidden space-y-2 lg:block">
                {FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 font-medium"
                  >
                    <CheckCircle2Icon className="text-primary size-4" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Suspense fallback={<CustomerSummerSkeleton />}>
                <CustomerSummary />
              </Suspense>

              <div className="flex w-full max-w-md flex-col justify-center gap-3 xl:flex-row">
                <Button className="w-full xl:flex-1" size="lg" asChild>
                  <Link href="/products">
                    <PackageIcon />
                    Explore The Collection
                  </Link>
                </Button>
                <Button
                  className="w-full xl:flex-1"
                  variant="outline"
                  size="lg"
                  disabled
                >
                  <Sparkles />
                  Can&apos;t Find It? Request It (Soon)
                </Button>
              </div>
            </div>

            <div className="hidden size-full min-h-32 items-center justify-center lg:flex">
              <AspectRatio
                ratio={1}
                className="flex items-center justify-center rounded-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/test.webp"
                  alt="Hero"
                  className="animate-blur-in scale-150 rounded-3xl object-cover object-center"
                />
              </AspectRatio>
            </div>
          </div>
        </MaxWidthWrapper>

        <HeroBackground />
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div className="absolute inset-x-0 -bottom-1/2 z-0 h-full opacity-80">
      <div className="hero-ring size-[620px]" />
      <div className="hero-ring size-[820px]" />
      <div className="hero-ring size-[1020px]" />
      <div className="hero-ring size-[1220px]" />

      <Orbit
        size={470}
        rotation={-14}
        orbitDuration={30}
        spinDuration={18}
        shouldOrbit
        shouldSpin
      >
        <Sparkles className="fill-primary text-primary size-8 opacity-20" />
      </Orbit>

      <Orbit
        size={460}
        rotation={79}
        shouldOrbit
        orbitDuration={32}
        shouldSpin
        spinDuration={6}
      >
        <Sparkles className="fill-primary text-primary size-5 opacity-20" />
      </Orbit>

      <Orbit size={520} rotation={-41} orbitDuration={34} shouldOrbit>
        <div className="bg-primary size-2 rounded-full opacity-20" />
      </Orbit>
      <Orbit
        size={530}
        rotation={178}
        orbitDuration={36}
        spinDuration={6}
        shouldOrbit
        shouldSpin
      >
        <HeadphonesIcon className="text-primary size-10 opacity-20" />
      </Orbit>

      <Orbit
        size={625}
        rotation={20}
        orbitDuration={38}
        spinDuration={8}
        shouldOrbit
        shouldSpin
      >
        <Sparkle className="fill-primary text-primary size-12" />
      </Orbit>
      <Orbit
        size={610}
        rotation={98}
        orbitDuration={40}
        spinDuration={8}
        shouldOrbit
        shouldSpin
      >
        <IconMouse2 className="text-primary size-8" />
      </Orbit>

      <Orbit size={660} rotation={-5} shouldOrbit orbitDuration={42}>
        <div className="bg-primary size-2 rounded-full opacity-20" />
      </Orbit>
      <Orbit
        size={710}
        rotation={144}
        shouldOrbit
        orbitDuration={44}
        shouldSpin
        spinDuration={6}
      >
        <Sparkles className="fill-primary text-primary size-14 opacity-20" />
      </Orbit>

      <Orbit size={740} rotation={85} shouldOrbit orbitDuration={46}>
        <div className="bg-primary size-3 rounded-full opacity-20" />
      </Orbit>

      <Orbit
        size={840}
        rotation={128}
        orbitDuration={48}
        spinDuration={8}
        shouldOrbit
        shouldSpin
      >
        <IconKeyboard className="text-primary size-28" />
      </Orbit>

      <Orbit
        size={840}
        rotation={-72}
        orbitDuration={48}
        spinDuration={8}
        shouldOrbit
        shouldSpin
      >
        <Gamepad2Icon className="text-primary size-28" />
      </Orbit>
    </div>
  );
}

function CustomerSummerSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <ul className="flex items-center -space-x-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index}>
              <Skeleton className="size-10 rounded-full" />
            </li>
          ))}
        </ul>

        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="size-4 fill-yellow-400 stroke-yellow-400"
              />
            ))}
          </div>

          <p>
            <span className="font-medium">999</span> Happy Customers
            <svg className="stroke-primary w-6 stroke-8" viewBox="0 0 100 20">
              <path d="M0 10 C25 0, 75 20, 100 10" fill="none" />
            </svg>
          </p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm font-medium">
        Sign in to get your name added to the list
      </p>
    </div>
  );
}

async function CustomerSummary() {
  const customersSummary =
    await app.public.customers.queries.getCustomerSummary();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <ul className="flex items-center -space-x-4">
          {customersSummary?.summary.map((customer) => (
            <li key={customer.name}>
              <ImageWithFallback
                src={customer.image}
                alt={customer.name}
                className="size-10 rounded-full"
                width={40}
                height={40}
              />
            </li>
          ))}
        </ul>

        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="size-4 fill-yellow-400 stroke-yellow-400"
              />
            ))}
          </div>

          <p>
            <span className="font-medium">
              {+(customersSummary?.count ?? 0) +
                (customersSummary?.count ? 240 : 0)}
            </span>{" "}
            Happy Customers
            <svg className="stroke-primary w-6 stroke-8" viewBox="0 0 100 20">
              <path d="M0 10 C25 0, 75 20, 100 10" fill="none" />
            </svg>
          </p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm font-medium">
        Sign in to get your name added to the list
      </p>
    </div>
  );
}
