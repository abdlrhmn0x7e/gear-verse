import { TrustPromisesPanel } from "~/components/features/trust/trust-promises-panel";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export function TrustStrip() {
  return (
    <section className="pb-4 md:pb-8">
      <MaxWidthWrapper>
        <TrustPromisesPanel />
      </MaxWidthWrapper>
    </section>
  );
}
