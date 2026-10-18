import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getStoreSettings } from "~/lib/store-settings";
import { cn } from "~/lib/utils";
import { ChatReveal } from "./chat-reveal";

type Message = {
  from: "you" | "store";
  text: string;
  time: string;
  /** dropped on phones, where four bubbles run to two screens */
  phoneHidden?: boolean;
};

/** An example request played out, so the steps are shown rather than listed. The quote is illustrative. */
const CHAT: Message[] = [
  {
    from: "you",
    text: "Hi Gear Verse, can you get me this? Logitech G Pro X Superlight 2 in white",
    time: "21:04",
  },
  {
    from: "store",
    text: "We can. It's EGP 7,850 to your door, arriving in about 2 weeks. Want us to order it?",
    time: "21:11",
  },
  { from: "you", text: "Yes, go ahead", time: "21:12" },
  {
    from: "store",
    text: "Done. We'll handle customs and message you when it's on its way.",
    time: "21:13",
    phoneHidden: true,
  },
];

/**
 * The request flow demonstrated as a short WhatsApp exchange beside a one-line form. The form is still a plain GET to
 * /request, which opens WhatsApp with the item already typed.
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
      <MaxWidthWrapper className="grid items-center gap-10 lg:grid-cols-2 lg:gap-x-16">
        <div className="space-y-8">
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
            className="max-w-lg space-y-3"
          >
            <Label htmlFor="request-item">What do you want?</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="request-item"
                name="item"
                maxLength={300}
                autoComplete="off"
                placeholder="A model name or a link"
                className="h-12 px-5 sm:flex-1 pointer-coarse:h-12"
              />
              <Button type="submit" size="xl">
                <IconBrandWhatsapp data-icon="inline-start" stroke={1.75} />
                Ask on WhatsApp
              </Button>
            </div>
            <p className="text-muted-foreground text-sm text-pretty">
              Free to ask. You only pay if you go ahead.
            </p>
          </form>
        </div>

        <figure className="space-y-3">
          <div className="bg-card rounded-[2rem] p-3">
            <div className="flex items-center gap-3 px-3 pt-2 pb-4">
              <span className="bg-raised flex size-10 items-center justify-center rounded-full text-sm font-medium">
                GV
              </span>
              <div className="min-w-0">
                <p className="font-medium">Gear Verse</p>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <IconBrandWhatsapp className="size-3.5" aria-hidden />
                  WhatsApp
                </p>
              </div>
            </div>
            <ChatReveal className="bg-input-background flex flex-col gap-2 rounded-[1.5rem] p-4 sm:p-5">
              <ol className="contents" aria-label="An example request">
                {CHAT.map((message, index) => (
                  <li
                    key={message.time}
                    style={{ transitionDelay: `${index * 450}ms` }}
                    className={cn(
                      message.phoneHidden && "max-sm:hidden",
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-pretty transition-[opacity,translate,scale] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:translate-y-2 motion-safe:scale-[0.97] motion-safe:opacity-0 motion-safe:group-data-shown/chat:translate-y-0 motion-safe:group-data-shown/chat:scale-100 motion-safe:group-data-shown/chat:opacity-100",
                      message.from === "you"
                        ? "bg-primary text-primary-foreground origin-bottom-right self-end rounded-br-md"
                        : "bg-card origin-bottom-left self-start rounded-bl-md",
                    )}
                  >
                    <span className="sr-only">
                      {message.from === "you" ? "You: " : "Gear Verse: "}
                    </span>
                    {message.text}
                    <span
                      className="ms-3 inline-block translate-y-0.5 text-xs tabular-nums opacity-60"
                      aria-hidden
                    >
                      {message.time}
                    </span>
                  </li>
                ))}
              </ol>
            </ChatReveal>
          </div>
          <figcaption className="text-muted-foreground px-3 text-sm">
            An example request. Every quote is priced per item.
          </figcaption>
        </figure>
      </MaxWidthWrapper>
    </section>
  );
}
