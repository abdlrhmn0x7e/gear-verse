import { TRUST_PROMISES } from "~/components/features/trust/trust-promises";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export function TrustStrip() {
  return (
    <section aria-label="Our promises" className="pb-4 md:pb-8">
      <MaxWidthWrapper>
        <ul className="bg-card grid gap-8 rounded-3xl p-8 md:grid-cols-3 md:gap-6 md:p-10">
          {TRUST_PROMISES.map((promise) => (
            <li key={promise.title} className="flex items-start gap-4">
              <span className="bg-background flex size-11 shrink-0 items-center justify-center rounded-full">
                <promise.icon
                  className="size-5"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
              <div className="space-y-1">
                <h3 className="font-medium">{promise.title}</h3>
                <p className="text-muted-foreground text-sm text-pretty">
                  {promise.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
