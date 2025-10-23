import { Heading } from "~/components/heading";
import { Logo } from "~/components/logo";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export function Hero() {
  return (
    <section id="products-hero" className="pt-32">
      <MaxWidthWrapper>
        <div className="from-secondary to-accent relative z-0 overflow-hidden rounded-3xl bg-linear-to-r px-10 py-8 text-center md:text-left">
          <div className="dark:text-primary-foreground flex flex-col items-center justify-between gap-8 md:flex-row md:gap-16">
            <div>
              <Heading level={2} font="default">
                Explore Our Store
              </Heading>
              <p className="mt-2 text-sm font-medium md:text-base">
                Discover the latest gear, rare finds, and exclusive
                accessories—level up your setup with something extraordinary.
              </p>
            </div>
            <Logo className="h-16 md:h-24" width={256} height={256} />
          </div>

          <div
            className="absolute inset-0 -z-10 opacity-10"
            style={{ background: `url(/images/grain.jpg)` }}
          />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
