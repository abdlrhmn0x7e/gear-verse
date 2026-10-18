import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { getStoreSettings } from "~/lib/store-settings";

const STEPS = [
  {
    title: "Tell us what you want",
    description:
      "A model name or a link is enough. Not sure? Tell us what you need and we'll suggest something.",
  },
  {
    title: "Get a quote on WhatsApp",
    description: "The final price and when it'll arrive, up front.",
  },
  {
    title: "Say yes, we handle the rest",
    description: "We order it, handle customs and deliver it to your door.",
  },
];

/**
 * The way to everything that isn't on the shelf. The form is a plain GET to /request, which opens a WhatsApp
 * chat with the item already typed, so it works before hydration and the sale continues where the team replies.
 */
export async function RequestSection() {
  const { whatsappNumber } = await getStoreSettings();
  if (!whatsappNumber) return null;

  return (
    <section
      id="request"
      className="scroll-mt-24 py-12 md:py-16"
      aria-labelledby="request-heading"
    >
      {/* phones read pitch, form, steps; desktop moves the steps under the pitch, beside the form */}
      <MaxWidthWrapper className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-16">
        <div className="space-y-4">
          <p
            lang="ar"
            dir="rtl"
            className="text-muted-foreground w-fit font-medium"
          >
            مش لاقي اللي بتدور عليه؟
          </p>
          <h2
            id="request-heading"
            className="text-headline-sm md:text-headline text-balance"
          >
            Not on the shelf? We&apos;ll get it.
          </h2>
          <p className="text-muted-foreground text-body-lg max-w-lg text-pretty">
            Send us the model or a link on WhatsApp. We&apos;ll reply with the
            price and delivery time before you commit to anything.
          </p>
        </div>

        <form
          action="/request"
          method="get"
          target="_blank"
          className="bg-card flex flex-col gap-6 rounded-3xl p-6 md:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <div className="space-y-3">
            <Label htmlFor="request-item">What do you want?</Label>
            <Textarea
              id="request-item"
              name="item"
              rows={4}
              maxLength={300}
              placeholder="e.g. Logitech G Pro X Superlight 2 in white, or paste a link"
              className="min-h-32"
            />
          </div>

          <div className="space-y-3">
            <Button type="submit" size="xl" className="w-full">
              <IconBrandWhatsapp data-icon="inline-start" stroke={1.75} />
              Ask us on WhatsApp
            </Button>
            <p className="text-muted-foreground text-center text-sm text-pretty">
              Opens WhatsApp with your message ready to send. Free to ask, and
              you only pay if you go ahead.
            </p>
          </div>
        </form>

        <ol className="space-y-6 lg:col-start-1 lg:row-start-2">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1"
            >
              <span
                className="text-muted-foreground text-sm tabular-nums"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-title">{step.title}</h3>
              <p className="text-muted-foreground col-start-2 text-pretty">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </MaxWidthWrapper>
    </section>
  );
}
