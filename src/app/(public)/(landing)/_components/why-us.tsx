import { MaxWidthWrapper } from "~/components/max-width-wrapper";

const PILLARS = [
  {
    title: "Worth the money",
    description:
      "Value is the filter. If a product doesn't earn its price, it doesn't make the shelf.",
  },
  {
    title: "Picked, not piled",
    description:
      "A few good options per category, so you can choose in minutes instead of comparing 40 near-identical listings.",
  },
  {
    title: "We've got you",
    description:
      "In stock in Egypt, delivered in 1–2 days, and covered if it arrives defective. Want something we don't carry? Ask and we'll get it.",
  },
];

/** The page's one brand panel: plum carries the story, never an action. */
export function WhyUs() {
  return (
    <section
      id="why-us"
      className="py-12 md:py-16"
      aria-labelledby="why-us-heading"
    >
      <MaxWidthWrapper>
        <div className="bg-brand-solid text-brand-solid-foreground grid gap-12 rounded-[2rem] p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
          <div className="space-y-6">
            <h2
              id="why-us-heading"
              className="text-headline-sm md:text-headline text-balance"
            >
              We pick, so you don&apos;t have to dig.
            </h2>
            <p className="text-body-lg max-w-lg text-pretty opacity-80">
              Most stores here either stock everything at a markup or carry the
              same thin selection. We keep a short list of gear we&apos;d stand
              behind and tell you straight what each one is good at.
            </p>
          </div>

          <ol className="divide-brand-solid-foreground/20 divide-y">
            {PILLARS.map((pillar, index) => (
              <li
                key={pillar.title}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-6 first:pt-0 last:pb-0"
              >
                <span className="text-sm tabular-nums opacity-70" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-title">{pillar.title}</h3>
                <p className="col-start-2 text-pretty opacity-80">
                  {pillar.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
