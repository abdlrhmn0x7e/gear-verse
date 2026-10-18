import { MaxWidthWrapper } from "~/components/max-width-wrapper";

const STEPS = [
  {
    title: "We source rare gear",
    description:
      "We hunt global sellers and verified stores to locate the exact item you want.",
  },
  {
    title: "Customs handled for you",
    description:
      "We prepare invoices and declarations and clear customs, so you don't get blocked or surprised.",
  },
  {
    title: "Delivered to your door",
    description:
      "Your order arrives at your doorstep. No stress, no surprise fees.",
  },
];

/** The page's one brand panel: plum carries the story, never an action. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-12 md:py-16"
      aria-labelledby="how-it-works-heading"
    >
      <MaxWidthWrapper>
        <div className="bg-brand-solid text-brand-solid-foreground grid gap-12 rounded-[2rem] p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
          <div className="space-y-6">
            <h2
              id="how-it-works-heading"
              className="text-headline-sm md:text-headline text-balance"
            >
              Tired of the limited options?
            </h2>
            <p className="text-body-lg max-w-lg text-pretty opacity-80">
              You find the perfect keyboard, mouse or headset online, but it
              doesn&apos;t ship here or gets stuck in customs for months. Local
              stores carry the same limited selection at inflated prices. Here
              is how we fix that.
            </p>
          </div>

          <ol className="divide-brand-solid-foreground/20 divide-y">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-6 first:pt-0 last:pb-0"
              >
                <span className="text-sm tabular-nums opacity-70" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-title">{step.title}</h3>
                <p className="col-start-2 text-pretty opacity-80">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
