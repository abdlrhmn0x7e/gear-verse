import { cva } from "class-variance-authority";
import { tanNimbus } from "~/fonts";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
const headingVariants = cva("scroll-m-20 tracking-tight text-balance", {
  variants: {
    level: {
      1: `text-4xl font-extrabold ${tanNimbus.className}`,
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
}: {
  children: React.ReactNode;
  className?: string;
  level?: Level;
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={headingVariants({ level, className })}>{children}</Tag>
  );
}
