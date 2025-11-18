import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export function FAQ() {
  const faq = [
    {
      question: "What is GearVerse?",
      answer:
        "GearVerse is your premier destination for gaming gear in Egypt. We provide access to the latest gaming accessories, peripherals, and equipment that might not be readily available locally, delivering them right to your doorstep.",
    },
    {
      question: "Do you deliver anywhere in Egypt?",
      answer:
        "Yes! We offer nationwide delivery across Egypt. Shipping times and costs may vary depending on your location. You can check the estimated delivery time during checkout.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We want you to be completely satisfied with your purchase. If you're not happy with your order, you can initiate a return or refund request. Please contact our support team for assistance with returns.",
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
      answer:
        "If you receive a damaged or defective product, please contact our customer support immediately with photos of the issue. We'll arrange for a replacement or full refund as quickly as possible.",
    },
  ];
  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="max-w-4xl space-y-8">
        <Heading level={1} className="text-center">
          Frequently Asked Questions
        </Heading>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          {faq.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MaxWidthWrapper>
    </section>
  );
}
