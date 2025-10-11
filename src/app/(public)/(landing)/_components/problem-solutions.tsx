import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Heading } from "~/components/heading";
import Glow from "~/components/ui/glow";
import { cn } from "~/lib/utils";
import type { PropsWithChildren } from "react";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  Gamepad2Icon,
  KeyboardIcon,
  VideoIcon,
} from "lucide-react";
import { Earth } from "~/components/earth";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { IconCoin, IconMouse, IconSparkles } from "@tabler/icons-react";
import { OpenPackage } from "~/components/open-package";

export function ProblemSolutions() {
  const solutions = [
    {
      title: "Tell us what you want",
      description:
        "Send a product link, photo or model name — we’ll get a full price & delivery time.",
      Illustration: RequestIllustration,
    },
    {
      title: "We Source Rare Gear",
      description:
        "We hunt global sellers and verified stores to locate the exact item you want.",
      Illustration: SourceRareGearsIllustration,
    },
    {
      title: "Customs handled for you",
      description:
        "We prepare invoices, declarations, and clear customs so you don’t get blocked or surprised.",
      Illustration: CustomsIllustration,
    },
    {
      title: "Last but not least, we'll deliver the product to you",
      description:
        "You'll get the product delivered to your doorstep. No stress, no surprise fees.",
      Illustration: DeliveryIllustration,
    },
  ];

  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="flex max-w-screen-xl flex-col items-center gap-6">
        <div className="max-w-4xl flex-1 text-center">
          <Heading level={1}>Tired of the limited options?</Heading>

          <p className="text-muted-foreground text-lg">
            Every serious gamer in Egypt knows the struggle. You see the perfect
            keyboard, mouse, or headset online, but it either doesn&apos;t ship
            here or gets stuck in customs hell for months. Meanwhile, local
            stores carry the same limited selection at inflated prices.
            Here&apos;s how we can help.
          </p>
        </div>

        <div className="grid w-full flex-1 grid-cols-1 grid-rows-[repeat(2,400px)] gap-5 p-1 lg:grid-cols-6">
          {solutions.map((solution, index) => (
            <div
              key={solution.title}
              className={cn(
                "from-primary/60 to-border dark:from-primary/10 dark:to-border/50 my-1 size-full overflow-hidden rounded-lg bg-gradient-to-b p-px",
                index === 0 && "sm:row-span-2 lg:col-span-2",
                index === 1 && "lg:col-span-4",
                index === 2 && "lg:col-span-2",
                index === 3 && "lg:col-span-2",
              )}
            >
              <div className="group relative size-full">
                <div className="from-card to-background relative flex size-full flex-col justify-start gap-8 overflow-hidden rounded-lg bg-gradient-to-b p-8">
                  <div className="flex-1">
                    <solution.Illustration />
                  </div>

                  <div className="from-card/90 via-card/80 absolute inset-x-0 bottom-0 z-12 shrink-0 rounded-lg bg-gradient-to-t to-transparent p-4">
                    <Heading level={2}>{solution.title}</Heading>
                    <p>{solution.description}</p>
                  </div>
                </div>

                <Glow
                  variant="bottom"
                  className="z-0 w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}

function RequestIllustration() {
  return (
    <MockPhone className="group relative z-10 [mask-image:linear-gradient(to_bottom,transparent,black_0%,black_70%,transparent)]">
      <div className="absolute inset-0 z-10 -translate-y-48 p-8 opacity-0 transition-all duration-500 group-hover:-translate-y-0 group-hover:opacity-100">
        <div className="bg-card flex flex-col gap-2 rounded-xl border p-1">
          <div className="flex items-center gap-2">
            <Logo
              className="size-16 shrink-0 rounded-lg border"
              transparent={false}
            />

            <div className="flex flex-col">
              <p className="text-sm font-medium">Gear Verse</p>
              <p className="text-muted-foreground text-xs">
                What are you waiting for? order something now!
              </p>
            </div>
          </div>

          <Button className="w-full" asChild>
            <Link href="/products">
              <ArrowUpRightIcon />
              Explore our store
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b p-4">
        <ChevronLeftIcon className="size-6" />
        <div className="flex flex-col items-center gap-0.5">
          <Avatar>
            <AvatarImage src="/images/customer.jpeg" />
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>

          <p className="text-sm">Cool ahh customer</p>
        </div>

        <VideoIcon className="size-6" />
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="mr-10 space-y-3 md:mr-24">
          <AspectRatio ratio={16 / 9} className="ml-10">
            <div className="bg-muted-foreground flex size-full items-center justify-center rounded-lg">
              <KeyboardIcon className="text-muted size-24" />
            </div>
          </AspectRatio>

          <div className="flex items-end gap-2">
            <Avatar>
              <AvatarImage src="/images/customer.jpeg" />
              <AvatarFallback>CC</AvatarFallback>
            </Avatar>
            <div className="bg-card rounded-lg border p-2">
              <p className="text-sm">Can you get me this cool ahh keyboard?</p>
            </div>
          </div>
        </div>

        <div className="ml-12 space-y-2 md:ml-24">
          <div className="flex items-end gap-2">
            <div className="bg-card rounded-lg border p-2">
              <p className="text-sm">
                Sure, anything for our cool ahh customer!
              </p>
            </div>

            <Avatar className="border">
              <AvatarImage src="/images/gear-light.png" />
              <AvatarFallback>GV</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </MockPhone>
  );
}

function MockPhone({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("mx-auto max-w-sm", className)}>
      <AspectRatio ratio={9 / 19.5}>
        <div className="bg-foreground relative size-full overflow-hidden rounded-[4rem] border p-3">
          <div className="dark:bg-background relative size-full overflow-hidden rounded-[calc(4rem-0.75rem)] bg-zinc-50 pt-12 pb-6">
            <div className="bg-foreground absolute top-3 left-1/2 z-10 h-8 w-full max-w-[8rem] -translate-x-1/2 rounded-full" />

            {children}
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-10"
            style={{ background: `url(/images/grain.jpg)` }}
          />
        </div>
      </AspectRatio>
    </div>
  );
}

function SourceRareGearsIllustration() {
  return (
    <div className="group relative z-10">
      <Earth className="text-foreground stroke-foreground max-h-[8rem] w-full scale-200 [mask-image:linear-gradient(to_bottom,transparent,black_50%,black_60%,transparent)] lg:max-h-[16rem]" />

      <div className="scan-orbit-center animate-scan-orbit scan-radius-sm lg:scan-radius-md scan-speed-slow">
        <div className="absolute top-0 left-0">
          <div className="border-secondary ring-primary bg-background/80 flex size-16 items-center justify-center rounded-full border-8 ring-4 transition-all duration-300 lg:size-48 lg:border-[1rem]">
            <Gamepad2Icon className="text-primary dark:text-primary-foreground size-8 lg:size-24" />
          </div>

          <div className="border-primary from-muted to-accent secondary absolute -right-3 -bottom-8 h-8 w-4 -rotate-45 rounded-full border-4 bg-gradient-to-b lg:-right-6 lg:-bottom-16 lg:h-24 lg:w-8" />
        </div>
      </div>
    </div>
  );
}

function CustomsIllustration() {
  return (
    <div className="group relative z-10 mx-auto max-w-xs">
      <div className="mr-4 ml-8 flex -space-x-36 overflow-y-clip pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`paper-${index}`}
            className="size-full max-w-48"
            style={{ rotate: `${(2 - index) * -5}deg`, zIndex: -index }}
          >
            <AspectRatio ratio={1 / Math.sqrt(2)}>
              <div className="bg-card flex size-full flex-col gap-2 rounded-xl border px-4 py-6">
                {index === 0 && (
                  <div className="flex flex-col items-center justify-center">
                    <IconCoin className="size-6" />
                    <span className="text-center font-medium tracking-wide">
                      Boring Logistics
                    </span>
                  </div>
                )}
                <div className="bg-muted h-3 w-full rounded-full" />
                <div className="bg-muted h-3 w-full rounded-full" />
                <div className="bg-muted h-3 w-full rounded-full" />
              </div>
            </AspectRatio>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-48">
        <div className="from-card to-background relative -z-10 size-full rounded-xl border bg-gradient-to-b" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-36 flex-col overflow-hidden">
        <div className="bg-accent relative z-10 -mb-1 h-4 w-1/2 shrink-0 overflow-hidden rounded-tl-xl rounded-tr-full border-t-2 border-l p-4">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 bottom-1 z-10 opacity-5"
            style={{ background: `url(/images/grain.jpg)` }}
          />
        </div>
        <div className="from-accent to-card w-full flex-1 overflow-hidden rounded-b-xl border-x border-t-2 border-b bg-gradient-to-b">
          <div
            className="pointer-events-none absolute inset-x-0 top-[30px] bottom-0 z-10 rounded-b-xl opacity-5"
            style={{ background: `url(/images/grain.jpg)` }}
          />
        </div>
      </div>

      <div className="absolute bottom-2 left-4 opacity-50">
        <Logo />
      </div>
    </div>
  );
}

function DeliveryIllustration() {
  return (
    <div className="relative flex h-full items-end justify-center">
      <OpenPackage className="relative z-10 -mb-4 size-64" />

      <div
        className="absolute top-8 left-1/2 -translate-x-1/2 rotate-180 opacity-50 blur-3xl"
        style={{
          width: 0,
          height: 0,
          borderLeft: "8rem solid transparent",
          borderRight: "8rem solid transparent",
          borderBottom: "12rem solid var(--primary)",
          marginTop: "1rem",
        }}
      />

      <div className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 select-none">
        <div className="relative h-[14rem] w-[22rem]">
          <Gamepad2Icon
            className="text-accent-foreground animate-float absolute top-[38%] left-[26%] size-12 md:size-16 lg:top-[42%] lg:left-[20%]"
            style={{ animationDuration: "6s", animationDelay: "0.1s" }}
          />
          <KeyboardIcon
            className="text-accent-foreground animate-float absolute top-[36%] left-[62%] size-12 md:size-16 lg:left-[66%]"
            style={{ animationDuration: "7.2s", animationDelay: "0.3s" }}
          />
          <IconMouse
            className="text-accent-foreground animate-float absolute top-[18%] left-[46%] size-12 md:size-16 lg:left-[40%]"
            style={{ animationDuration: "5.4s", animationDelay: "0.2s" }}
          />

          <IconSparkles
            className="text-foreground/80 animate-twinkle absolute top-[10%] left-[20%] size-6 md:size-8"
            style={{ animationDuration: "2.8s", animationDelay: "0.6s" }}
          />
          <IconSparkles
            className="text-foreground/80 animate-twinkle absolute top-[8%] left-[60%] size-6 md:size-8"
            style={{ animationDuration: "2.2s", animationDelay: "0.2s" }}
          />
          <IconSparkles
            className="text-foreground/80 animate-twinkle absolute top-[30%] left-[82%] size-6 md:size-8"
            style={{ animationDuration: "2.6s", animationDelay: "0.1s" }}
          />
          <IconSparkles
            className="text-foreground/80 animate-twinkle absolute top-[28%] left-[6%] size-6 md:size-8"
            style={{ animationDuration: "2.4s", animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
