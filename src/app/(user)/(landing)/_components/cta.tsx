import { Gamepad2Icon, GamepadIcon } from "lucide-react";
import Link from "next/link";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export async function CTA() {
  return (
    <section className="py-24">
      <MaxWidthWrapper>
        <div className="group bg-background text-foreground relative mx-auto flex max-w-screen-lg flex-col items-center gap-10 overflow-hidden rounded-2xl px-6 py-10 md:px-14 md:py-16">
          <div
            className="fade-top-lg pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow:
                "0 -16px 128px 0 var(--primary) inset, 0 -16px 32px 0 color-mix(in oklab, var(--primary) 50%, transparent) inset",
            }}
          />

          <div className="flex flex-col items-center gap-4 text-center">
            <Badge>
              <GamepadIcon />
              Get Started
            </Badge>
            <h2 className="from-foreground to-accent-foreground/90 bg-gradient-to-b bg-clip-text text-3xl font-semibold text-transparent lg:text-4xl">
              Ready to Upgrade Your Gaming Experience?
            </h2>
            <p className="max-w-xl md:text-lg">
              {`Stop settling for whatever's available locally. Get the gaming gear you actually want, delivered to your door in Egypt.`}
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/products">
              Shop Now <Gamepad2Icon />
            </Link>
          </Button>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
