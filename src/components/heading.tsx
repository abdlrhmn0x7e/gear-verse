import { cva } from "class-variance-authority";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
const headingVariants = cva("scroll-m-20 text-balance", {
  variants: {
    level: {
      1: "text-headline-sm md:text-headline",
      2: "text-2xl font-medium tracking-tight md:text-3xl",
      3: "text-title",
      4: "text-lg font-medium md:text-xl",
      5: "text-base font-medium md:text-lg",
      6: "text-sm font-medium md:text-base",
    },
  },
});

export function Heading({
  children,
  className,
  level = 1,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  level?: Level;
  /** the element to render when the outline needs a different level than the look, e.g. a page's h1 styled small */
  as?: Level;
}) {
  const Tag = `h${as ?? level}` as const;
  return (
    <Tag className={headingVariants({ level, className })}>{children}</Tag>
  );
}
