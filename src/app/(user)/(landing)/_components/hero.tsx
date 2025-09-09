import { Sparkle, Sparkles } from "lucide-react";
import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Orbit } from "~/components/orbit";
import { Badge } from "~/components/ui/badge";

export function Hero() {
  return (
    <section className="relative">
      <MaxWidthWrapper className="flex h-screen flex-col items-center justify-center">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-12 pb-12">
          <div className="flex w-full flex-col items-center gap-6">
            <Badge>
              <Sparkles />
              Rare Gaming Gear, Delivered to Egypt
            </Badge>

            <div className="flex flex-col items-center gap-1">
              <Heading>Gear Verse</Heading>
              <p className="text-muted-foreground max-w-xl text-xl">
                Hard-to-find gaming peripherals and accessories from
                international brands — hand-imported, customs cleared, and
                delivered to your door.
              </p>
            </div>
          </div>

          {/* <div className="bg-card flex w-full flex-1 flex-col gap-3 rounded-lg border p-4 text-center">
            <Heading level={2} font="sans">
              Featured Products
            </Heading>

            <div className="grid flex-1 grid-cols-3 gap-4">
              <div className="from-primary/5 h-full rounded-lg border bg-gradient-to-bl to-transparent p-4" />
              <div className="from-primary/5 rounded-lg border bg-gradient-to-bl to-transparent p-4" />
              <div className="from-primary/5 rounded-lg border bg-gradient-to-bl to-transparent p-4" />
            </div>
          </div> */}
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_70%,transparent)]">
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
            <Sparkles className="fill-primary text-primary size-10 opacity-20" />
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
            <Sparkle className="fill-primary text-primary size-8" />
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
            rotation={-72}
            orbitDuration={48}
            spinDuration={8}
            shouldOrbit
            shouldSpin
          >
            <Sparkle className="fill-primary text-primary size-28" />
          </Orbit>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
