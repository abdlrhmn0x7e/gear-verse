import type { Metadata } from "next";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import { getStoreSettings } from "~/lib/store-settings";
import { REPORT_ISSUE_MESSAGE } from "~/lib/whatsapp";
import { pageMetadata } from "~/lib/seo/metadata";

const TITLE = "Returns & Refunds Policy";

// the root title template adds " | Gear Verse"
export const metadata: Metadata = {
  title: TITLE,
  ...pageMetadata({
    title: TITLE,
    description:
      "We refund products that arrive defective or damaged when you report the issue within 24 hours of opening.",
    path: "/returns",
  }),
};

export default async function ReturnsPage() {
  const { whatsappNumber } = await getStoreSettings();

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <header className="max-w-2xl">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          Returns &amp; Refunds Policy
        </h1>
      </header>

      <article className="typeset mt-8 max-w-2xl md:mt-10">
        <h2>When we accept returns</h2>
        <p>
          We accept a return and refund only when the product arrives with a
          manufacturing defect, is damaged, or has a problem caused by us.
        </p>
        <p>To qualify:</p>
        <ul>
          <li>Report the issue within 24 hours of opening the product.</li>
          <li>
            Send photos or videos showing the problem. We may ask for these to
            confirm it.
          </li>
          <li>
            Our team will inspect the product and verify the issue before we
            approve anything.
          </li>
        </ul>

        <h2>What happens once we approve</h2>
        <ul>
          <li>We&apos;ll arrange to collect the product from you.</li>
          <li>Your refund will be processed within 7 days of approval.</li>
        </ul>

        <h2>When we can&apos;t accept a return</h2>
        <p>We can&apos;t accept a return or refund if:</p>
        <ul>
          <li>
            The product was opened and our inspection finds no defect or issue.
          </li>
          <li>
            The problem was caused by misuse, mishandling, or accidental damage
            after delivery.
          </li>
          <li>You reported the issue after the 24-hour window.</li>
        </ul>

        <h2>Good to know</h2>
        <p>
          We may decline any return that doesn&apos;t meet the conditions above.
          By placing an order, you agree to this policy.
        </p>

        {whatsappNumber && (
          <>
            <h2>How to report an issue</h2>
            <p>
              Report it on WhatsApp at{" "}
              <WhatsAppNumberLink
                number={whatsappNumber}
                message={REPORT_ISSUE_MESSAGE}
                className="tabular-nums"
              />{" "}
              within 24 hours of opening the product, with photos or videos
              showing the problem.
            </p>
          </>
        )}
      </article>
    </MaxWidthWrapper>
  );
}
