import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";

export function ClosingCTA() {
  return (
    <section className="pt-8 pb-8 md:pb-16" aria-labelledby="cta-heading">
      <MaxWidthWrapper>
        <div className="dark contrast-tile flex flex-col items-center gap-8 rounded-[2rem] px-6 py-16 text-center md:py-24">
          <div className="max-w-2xl space-y-4">
            <h2
              id="cta-heading"
              className="text-headline-sm md:text-headline text-balance"
            >
              Ready to upgrade your setup?
            </h2>
            <p className="text-muted-foreground text-body-lg text-pretty">
              Stop settling for whatever&apos;s available locally. Get the gear
              you actually want, delivered to your door in Egypt.
            </p>
          </div>
          <Button size="xl" asChild>
            <Link href="/products">
              Shop the store
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
