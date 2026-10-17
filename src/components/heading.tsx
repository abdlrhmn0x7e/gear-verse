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
}: {
  children: React.ReactNode;
  className?: string;
  level?: Level;
}) {
  const Tag = `h${level}` as const;
  return <Tag className={headingVariants({ level, className })}>{children}</Tag>;
}
