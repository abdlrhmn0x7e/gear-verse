import Link from "next/link";
import type { ReactNode } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { getStoreSettings } from "~/lib/store-settings";
import { REPORT_ISSUE_MESSAGE } from "~/lib/whatsapp";

const inlineLinkClassName =
  "text-foreground underline decoration-from-font underline-offset-4";

const POLICY_LINK = (
  <Link href="/returns" className={inlineLinkClassName}>
    Returns &amp; Refunds Policy
  </Link>
);

export async function FAQ() {
  const { discordUrl, whatsappNumber } = await getStoreSettings();

  /** " on WhatsApp at +20 …", where a policy answer says to report a problem */
  const onWhatsApp = whatsappNumber && (
    <>
      {" "}
      on WhatsApp at{" "}
      <WhatsAppNumberLink
        number={whatsappNumber}
        message={REPORT_ISSUE_MESSAGE}
        className={`${inlineLinkClassName} tabular-nums`}
      />
    </>
  );
  const faq: { question: string; answer: ReactNode }[] = [
    {
      question: "What is Gear Verse?",
      answer:
        "Gear Verse is your premier destination for gaming gear in Egypt. We provide access to the latest gaming accessories, peripherals, and equipment that might not be readily available locally, delivering them right to your doorstep.",
    },
    {
      question: "Do you deliver anywhere in Egypt?",
      answer:
        'Yes! We deliver across Egypt. Delivery times and the shipping fee depend on your location; see "How do I pay?" below for how the fee is confirmed and paid.',
    },
    {
      question: "How do I pay?",
      answer:
        "Cash on delivery is available. After you place your order, our team contacts you on WhatsApp or by phone to confirm it along with the shipping fee, which depends on your location. You pay the shipping fee in advance by InstaPay or mobile wallet (Vodafone Cash, Orange Cash or e& cash), and the rest to the courier on delivery, in cash, by InstaPay or by mobile wallet.",
    },
    {
      question: "What is your return policy?",
      answer: (
        <>
          We accept a return and refund only when a product arrives defective or
          damaged, or has a problem caused by us. Report the issue
          {onWhatsApp} within 24 hours of opening the product and send photos or
          videos of it. Once our team inspects the product and approves the
          return, we&apos;ll collect it and process your refund within 7 days.
          We can&apos;t take back a product that was opened and has no defect.
          Read the full {POLICY_LINK}.
        </>
      ),
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is placed, you can track its status through your account dashboard. You'll be able to see real-time updates on your order from processing to delivery.",
    },
    {
      question: "Are the products authentic and covered by warranty?",
      answer:
        "Absolutely! We only sell authentic gaming gear from trusted brands. Most products come with manufacturer warranty. Check the product details page for specific warranty information.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Delivery times vary based on your location and product availability. Typically, orders are delivered within 1-2 business days for most areas in Egypt. Rush delivery options may be available for certain locations.",
    },
    {
      question: "What if I receive a damaged or defective product?",
      answer: (
        <>
          Report it to us{onWhatsApp} within 24 hours of opening the product,
          with photos or videos showing the problem. Our team will inspect the
          product and verify the issue; once we approve it, we&apos;ll arrange
          to collect the product and process your refund within 7 days of
          approval. See our {POLICY_LINK} for the details.
        </>
      ),
    },
  ];
  return (
    <section id="faq" className="py-12 md:py-16" aria-labelledby="faq-heading">
      <MaxWidthWrapper className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <div className="space-y-4">
          <h2
            id="faq-heading"
            className="text-headline-sm md:text-headline text-balance"
          >
            Questions, answered
          </h2>
          {/* WhatsApp is the main channel; Discord stands in only until a number is set */}
          {whatsappNumber ? (
            <p className="text-muted-foreground text-body-lg max-w-sm text-pretty">
              Anything else? Ask us on WhatsApp at{" "}
              <WhatsAppNumberLink
                number={whatsappNumber}
                message="Hi Gear Verse, I have a question."
                className={`${inlineLinkClassName} tabular-nums`}
              />
              .
            </p>
          ) : (
            discordUrl && (
              <p className="text-muted-foreground text-body-lg max-w-sm text-pretty">
                Anything else? Ask us on{" "}
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={inlineLinkClassName}
                >
                  Discord
                </a>
                .
              </p>
            )
          )}
        </div>

        <Accordion type="single" collapsible defaultValue="item-1">
          {faq.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index + 1}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MaxWidthWrapper>
    </section>
  );
}
