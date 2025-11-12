import { cva } from "class-variance-authority";
import { tanNimbus } from "~/fonts";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
const headingVariants = cva(
  "text-pretty scroll-m-20 tracking-tight text-balance capitalize",
  {
    variants: {
      level: {
        1: `text-3xl md:text-3xl lg:text-4xl 2xl:text-5xl leading-12 md:leading-14 lg:leading-18 ${tanNimbus.className}`,
        2: "text-2xl md:text-3xl font-semibold",
        3: "text-xl md:text-2xl font-semibold",
        4: "text-lg md:text-xl font-medium",
        5: "text-base md:text-lg font-medium",
        6: "text-sm md:text-base",
      },
      font: {
        default: tanNimbus.className,
        sans: "font-sans",
      },
    },
  },
);

export function Heading({
  children,
  className,
  level = 1,
  font = "sans",
}: {
  children: React.ReactNode;
  className?: string;
  level?: Level;
  font?: "default" | "sans";
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag className={headingVariants({ level, className, font })}>
      {children}
    </Tag>
  );
}
