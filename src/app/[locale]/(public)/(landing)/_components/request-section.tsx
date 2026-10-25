import { IconBrandWhatsapp } from "@tabler/icons-react";
import { getLocale, getTranslations } from "next-intl/server";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Bubble, BubbleContent } from "~/components/ui/bubble";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Message, MessageContent, MessageGroup } from "~/components/ui/message";
import { localizedPath } from "~/lib/seo/metadata";
import { getStoreSettings } from "~/lib/store-settings";
import { cn } from "~/lib/utils";
import { ChatReveal } from "./chat-reveal";

type Message = {
  from: "you" | "store";
  /** under `landing.request.chat` */
  text: "ask" | "quote" | "confirm" | "done";
  time: string;
  /** dropped on phones, where four bubbles run to two screens */
  phoneHidden?: boolean;
};

/** An example request played out, so the steps are shown rather than listed. The quote is illustrative. */
const CHAT: Message[] = [
  {
    from: "you",
    text: "ask",
    time: "21:04",
  },
  {
    from: "store",
    text: "quote",
    time: "21:11",
  },
  { from: "you", text: "confirm", time: "21:12" },
  {
    from: "store",
    text: "done",
    time: "21:13",
    phoneHidden: true,
  },
];

/**
 * The request flow demonstrated as a short WhatsApp exchange beside a one-line form. The form is still a plain GET to
 * /request, which opens WhatsApp with the item already typed.
 */
export async function RequestSection() {
  const [{ whatsappNumber }, locale, t] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    getTranslations("landing.request"),
  ]);
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
            {/* an Arabic aside for English readers; the Arabic page already says it in the heading */}
            {locale === "en" && (
              <p
                lang="ar"
                dir="rtl"
                className="text-muted-foreground w-fit font-medium"
              >
                مش لاقي اللي بتدور عليه؟
              </p>
            )}
            <h2
              id="request-heading"
              className="text-headline-sm md:text-headline text-balance"
            >
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-body-lg max-w-lg text-pretty">
              {t("description")}
            </p>
          </div>

          <form
            action={localizedPath("/request", locale)}
            method="get"
            target="_blank"
            className="max-w-lg space-y-3"
          >
            <Label htmlFor="request-item">{t("label")}</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="request-item"
                name="item"
                maxLength={300}
                autoComplete="off"
                placeholder={t("placeholder")}
                className="h-12 px-5 sm:flex-1 pointer-coarse:h-12"
              />
              <Button type="submit" size="xl">
                <IconBrandWhatsapp data-icon="inline-start" stroke={1.75} />
                {t("submit")}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm text-pretty">
              {t("note")}
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
            <ChatReveal className="bg-background rounded-[1.5rem] p-4 sm:p-5">
              <MessageGroup role="list" aria-label={t("chatLabel")}>
                {CHAT.map((message, index) => {
                  const fromYou = message.from === "you";
                  return (
                    <Message
                      key={message.time}
                      role="listitem"
                      align={fromYou ? "end" : "start"}
                      style={{ transitionDelay: `${index * 450}ms` }}
                      className={cn(
                        message.phoneHidden && "max-sm:hidden",
                        "transition-[opacity,translate,scale] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:translate-y-2 motion-safe:scale-[0.97] motion-safe:opacity-0 motion-safe:group-data-shown/chat:translate-y-0 motion-safe:group-data-shown/chat:scale-100 motion-safe:group-data-shown/chat:opacity-100",
                        fromYou
                          ? "origin-bottom-right rtl:origin-bottom-left"
                          : "origin-bottom-left rtl:origin-bottom-right",
                      )}
                    >
                      <MessageContent>
                        <Bubble
                          variant={fromYou ? "default" : "muted"}
                          align={fromYou ? "end" : "start"}
                          className="max-w-[85%]"
                        >
                          <BubbleContent
                            className={cn(
                              "px-4 text-base text-pretty",
                              fromYou ? "rounded-ee-md" : "rounded-es-md",
                            )}
                          >
                            <span className="sr-only">
                              {`${fromYou ? t("you") : "Gear Verse"}: `}
                            </span>
                            {t.rich(`chat.${message.text}`, {
                              bdi: (chunks) => <bdi>{chunks}</bdi>,
                            })}
                            <span
                              className="ms-3 inline-block translate-y-0.5 text-xs tabular-nums opacity-60"
                              aria-hidden
                            >
                              {message.time}
                            </span>
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  );
                })}
              </MessageGroup>
            </ChatReveal>
          </div>
          <figcaption className="text-muted-foreground px-3 text-sm">
            {t("caption")}
          </figcaption>
        </figure>
      </MaxWidthWrapper>
    </section>
  );
}
