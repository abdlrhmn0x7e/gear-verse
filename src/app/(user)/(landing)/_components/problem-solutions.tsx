import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Heading } from "~/components/heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useMemo } from "react";
import {
  BanknoteIcon,
  MailOpenIcon,
  MessageCircleIcon,
  TruckIcon,
} from "lucide-react";
import Glow from "~/components/ui/glow";

export function ProblemSolutions() {
  const solutions = useMemo(
    () => [
      {
        title: "Send us a Request",
        description:
          "Send us a request for the product you want, and we'll get it for you.",
        Icon: MailOpenIcon,
      },
      {
        title: "Our Team Will Be in Touch",
        description:
          "Our team will be in touch with you to discuss the details and get the product for you.",
        Icon: MessageCircleIcon,
      },
      {
        title: "We handle the logistics",
        description: `Once the order is confirmed, our team sources your 
                    gear from trusted suppliers and manages all customs 
                    paperwork, import duties, and shipping logistics. 
                    No stress, no surprise fees.`,
        Icon: BanknoteIcon,
      },
      {
        title: "Last but not least, we'll deliver the product to you",
        description:
          "You'll get the product delivered to your doorstep. No stress, no surprise fees.",
        Icon: TruckIcon,
      },
    ],
    [],
  );

  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="flex flex-col gap-6 xl:flex-row">
        <div className="flex-1">
          <Heading level={1}>Tired of the limited options?</Heading>
          <p className="text-muted-foreground text-lg">
            Every serious gamer in Egypt knows the struggle. You see the perfect
            keyboard, mouse, or headset online, but it either doesn&apos;t ship
            here or gets stuck in customs hell for months. Meanwhile, local
            stores carry the same limited selection at inflated prices.
            Here&apos;s how we can help.
          </p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-[repeat(2,300px)] 2xl:grid-rows-[repeat(2,225px)]">
          {solutions.map((solution) => (
            <Card
              key={solution.title}
              className="group relative overflow-hidden bg-transparent"
            >
              <CardHeader>
                <div className="from-primary size-12 rounded-full bg-gradient-to-t to-transparent p-px">
                  <div className="from-accent flex size-full items-center justify-center rounded-full bg-gradient-to-b to-transparent p-1">
                    <solution.Icon />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {solution.title}
                </CardTitle>
                <CardDescription>{solution.description}</CardDescription>
              </CardHeader>

              <Glow
                variant="bottom"
                className="h-12 w-full opacity-0 transition-opacity group-hover:opacity-50"
              />
            </Card>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
