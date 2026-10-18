import { TrustPromiseItem } from "~/components/features/trust/trust-promise-item";
import { TRUST_PROMISES } from "~/components/features/trust/trust-promises";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export function TrustStrip() {
  return (
    <section aria-label="Our promises" className="pb-4 md:pb-8">
      <MaxWidthWrapper>
        <ul className="bg-card grid gap-6 rounded-3xl p-6 md:grid-cols-3 md:p-10">
          {TRUST_PROMISES.map((promise) => (
            <TrustPromiseItem
              key={promise.title}
              promise={promise}
              className="md:justify-center"
            />
          ))}
        </ul>
      </MaxWidthWrapper>
    </section>
  );
}
