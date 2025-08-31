import { cva } from "class-variance-authority";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
const headingVariants = cva("scroll-m-20 tracking-tight text-balance", {
  variants: {
    font: {
      serif: "font-serif",
      sans: "font-geist-sans",
    },
    level: {
      1: "text-center text-4xl font-extrabold",
      2: "text-3xl font-semibold",
      3: "text-2xl font-semibold",
      4: "text-xl font-semibold",
      5: "text-lg font-semibold",
      6: "text-base font-semibold",
    },
  },
});

export function Heading({
  children,
  className,
  level = 1,
  font = "serif",
}: {
  children: React.ReactNode;
  className?: string;
  level?: Level;
  font?: "serif" | "sans";
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={headingVariants({ level, font, className })}>
      {children}
    </Tag>
  );
}
