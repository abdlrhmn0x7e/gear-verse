import { TrustPromisesPanel } from "~/components/features/trust/trust-promises-panel";
import { TRUST_PROMISES } from "~/components/features/trust/trust-promises";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

/** The home page says "Verified products"; product pages and the cart keep "Originals only". */
const HOME_PROMISES = TRUST_PROMISES.map((promise) =>
  promise.title === "Originals only"
    ? { ...promise, title: "Verified products" }
    : promise,
);

export function TrustStrip() {
  return (
    <section className="pb-4 md:pb-8">
      <MaxWidthWrapper>
        <TrustPromisesPanel promises={HOME_PROMISES} />
      </MaxWidthWrapper>
    </section>
  );
}
