import { IconBrandWhatsapp } from "@tabler/icons-react";
import {
  ArrowRightIcon,
  CheckIcon,
  CreditCardIcon,
  HandCoinsIcon,
  PackageIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { formatDate } from "~/lib/utils/format-date";
import { humanizeString } from "~/lib/utils/humanize-string";
import { whatsAppLink } from "~/lib/whatsapp";
import type { RouterOutput } from "~/trpc/client";
import { orderTimeline, type TimelineStep } from "./order-status";

type Order = RouterOutput["public"]["orders"]["queries"]["findById"];

/**
 * Everything about one order, as stacked sections: where it is, what happens
 * next, what's in it, and where it goes. Shared by the orders drawer and the
 * order success page, so it holds no client state. Sections fill with
 * --input-background, which is the card gray on the page and white inside a
 * drawer.
 */
export function OrderDetails({
  order,
  whatsappNumber,
  headingLevel = 3,
  className,
}: {
  order: Order;
  /** E.164 from the store settings; without one the contact link is left out */
  whatsappNumber: string | null;
  /** the section headings' level, one below the heading the details sit under */
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as const;
  const Subheading = headingLevel === 2 ? "h3" : "h4";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <OrderSection title="Status" as={Heading}>
        <OrderTimeline order={order} />
      </OrderSection>

      <OrderSection title="What's next" as={Heading}>
        <OrderNextSteps order={order} />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {whatsappNumber && (
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={
                <a
                  href={whatsAppLink(
                    whatsappNumber,
                    `Hi Gear Verse, I have a question about my order #${order.id}.`,
                  )}
                  target="_blank"
                  rel="noopener"
                />
              }
            >
              <IconBrandWhatsapp data-icon="inline-start" />
              Contact us on WhatsApp
            </Button>
          )}
          <Button
            variant="ghost"
            size="lg"
            nativeButton={false}
            render={<Link href="/returns" />}
          >
            Returns policy
            <ArrowRightIcon
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Button>
        </div>
      </OrderSection>

      <OrderSection title="Items" as={Heading}>
        <OrderItems order={order} />
      </OrderSection>

      <OrderSection>
        <div className="grid gap-6 sm:grid-cols-2">
          {order.address && (
            <div className="min-w-0">
              <Subheading className="mb-2 font-medium">
                Delivery address
              </Subheading>
              <address className="text-muted-foreground text-sm not-italic">
                <span className="text-foreground block">
                  {order.address.fullName}
                </span>
                <span className="block">
                  {order.address.buildingNameOrNumber}, {order.address.address}
                </span>
                <span className="block">
                  {order.address.city},{" "}
                  {humanizeString(order.address.governorate, "snake")}
                </span>
                <span className="block tabular-nums" dir="ltr">
                  {order.address.phoneNumber}
                </span>
              </address>
            </div>
          )}

          <div className="min-w-0">
            <Subheading className="mb-2 font-medium">Payment</Subheading>
            {order.paymentMethod === "COD" ? (
              <>
                <p className="flex items-center gap-2 text-sm">
                  <HandCoinsIcon className="size-4 shrink-0" aria-hidden />
                  Cash on delivery
                </p>
                <p className="text-muted-foreground mt-1 text-sm text-pretty">
                  Shipping is prepaid by InstaPay or mobile wallet. The rest is
                  paid in cash to the courier.
                </p>
              </>
            ) : (
              <p className="flex items-center gap-2 text-sm">
                <CreditCardIcon className="size-4 shrink-0" aria-hidden />
                Online payment
              </p>
            )}
          </div>
        </div>
      </OrderSection>
    </div>
  );
}

function OrderSection({
  title,
  as: Heading = "h3",
  children,
}: {
  title?: string;
  as?: "h2" | "h3";
  children: React.ReactNode;
}) {
  return (
    <section className="bg-input-background rounded-2xl p-5">
      {title && <Heading className="mb-4 font-medium">{title}</Heading>}
      {children}
    </section>
  );
}

const STEP_STATE_LABEL: Record<TimelineStep["state"], string> = {
  done: "Done",
  current: "In progress",
  upcoming: "Not yet",
  stopped: "Stopped",
};

export function OrderTimeline({ order }: { order: Order }) {
  const steps = orderTimeline({ ...order, formatDate });

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const next = steps[index + 1];
        return (
          <li
            key={step.title}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {next && (
              <span
                aria-hidden
                className={cn(
                  "absolute start-[11px] top-7 bottom-1 w-0.5 rounded-full",
                  next.state === "upcoming" ? "bg-border" : "bg-foreground",
                )}
              />
            )}
            <StepMarker state={step.state} />
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "font-medium",
                  step.state === "upcoming" && "text-muted-foreground",
                )}
              >
                {step.title}
                <span className="sr-only">
                  , {STEP_STATE_LABEL[step.state]}
                </span>
              </p>
              {step.detail && (
                <p className="text-muted-foreground text-sm text-pretty">
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepMarker({ state }: { state: TimelineStep["state"] }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full",
        state === "done" && "bg-foreground text-background",
        state === "current" && "border-brand-text border-2",
        state === "upcoming" && "border-border border-2",
        state === "stopped" && "bg-muted-foreground text-background",
      )}
    >
      {state === "done" && <CheckIcon className="size-3.5" strokeWidth={3} />}
      {state === "current" && (
        <span className="bg-brand-text size-2 rounded-full" />
      )}
      {state === "stopped" && <XIcon className="size-3.5" strokeWidth={3} />}
    </span>
  );
}

type NextStep = { title: string; body: string };

const CHECK_YOUR_GEAR: NextStep = {
  title: "Check your gear",
  body: "We accept returns only for defects or damage reported within 24 hours of opening, with photos or a video.",
};

function nextSteps(order: Order): NextStep[] | string {
  const cod = order.paymentMethod === "COD";

  switch (order.status) {
    case "PENDING":
      return [
        {
          title: "We'll WhatsApp you",
          body: "Our team confirms your order and the shipping fee, which depends on your area.",
        },
        ...(cod
          ? [
              {
                title: "Prepay the shipping fee",
                body: "By InstaPay or mobile wallet: Vodafone Cash, Orange Cash or e& cash.",
              },
              {
                title: "Pay the rest on delivery",
                body: "In cash to the courier when your order arrives.",
              },
            ]
          : []),
      ];
    case "SHIPPED":
      return [
        ...(cod
          ? [
              {
                title: "Pay the rest on delivery",
                body: "In cash to the courier when your order arrives, usually within 1–2 business days.",
              },
            ]
          : []),
        CHECK_YOUR_GEAR,
      ];
    case "DELIVERED":
      return [CHECK_YOUR_GEAR];
    case "CANCELLED":
      return "This order was cancelled and won't ship. If you have a question about it, message us.";
    case "REFUNDED":
      return "This order was refunded. If you have a question about it, message us.";
  }
}

function OrderNextSteps({ order }: { order: Order }) {
  const steps = nextSteps(order);

  if (typeof steps === "string") {
    return <p className="text-muted-foreground text-sm text-pretty">{steps}</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3">
          <span
            aria-hidden
            className="bg-brand-subtle text-brand-text flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-medium">{step.title}</p>
            <p className="text-muted-foreground text-sm text-pretty">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** A product photo in the image well, or a package mark for a product without one. */
export function OrderThumbnail({
  src,
  alt,
  size,
}: {
  src: string | null;
  alt: string;
  /** the rendered size in CSS pixels */
  size: 56 | 64;
}) {
  return (
    <div
      className={cn(
        "image-well outline-image-outline shrink-0 overflow-hidden rounded-xl outline-1 -outline-offset-1",
        size === 56 ? "size-14" : "size-16",
      )}
    >
      {src ? (
        <ImageWithFallback
          src={src}
          alt={alt}
          className="size-full rounded-none border-none object-contain"
          width={size * 2}
          height={size * 2}
        />
      ) : (
        <span
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          className="flex size-full items-center justify-center text-(--neutral-500)"
        >
          <PackageIcon className="size-1/3" strokeWidth={1.5} aria-hidden />
        </span>
      )}
    </div>
  );
}

function OrderItems({ order }: { order: Order }) {
  const items = order.items ?? [];
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );

  return (
    <>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4">
            <OrderThumbnail src={item.thumbnailUrl} alt="" size={64} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
              {item.values && item.values.length > 0 && (
                <p className="text-muted-foreground text-sm">
                  {item.values.join(", ")}
                </p>
              )}
              {item.backorderedQuantity > 0 && (
                <Badge variant="warning" className="mt-1">
                  {item.backorderedQuantity === item.quantity
                    ? "Backorder"
                    : `${item.backorderedQuantity} of ${item.quantity} on backorder`}
                </Badge>
              )}
              <div className="mt-1 flex items-baseline justify-between gap-4 text-sm tabular-nums">
                <p className="text-muted-foreground">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
                <p className="font-medium">
                  {formatCurrency(item.quantity * item.price)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
        </div>
        {order.status !== "CANCELLED" && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-end">
              {order.status === "PENDING"
                ? "Confirmed on WhatsApp"
                : "Paid separately"}
            </dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 pt-1">
          <dt className="font-medium">Total</dt>
          <dd className="text-base font-medium tabular-nums">
            {formatCurrency(subtotal)}
            {order.status !== "CANCELLED" && (
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                + shipping
              </span>
            )}
          </dd>
        </div>
      </dl>
    </>
  );
}
