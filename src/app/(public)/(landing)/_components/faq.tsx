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
      question: "What is the best way to contact you?",
      answer: "You can contact us via email or phone.",
    },
    {
      question: "What is the best way to contact you?",
      answer: "You can contact us via email or phone.",
    },
    {
      question: "What is the best way to contact you?",
      answer: "You can contact us via email or phone.",
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
