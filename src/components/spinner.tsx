import { cva } from "class-variance-authority";
import { Loader } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      small: "h-4 w-4",
      medium: "h-6 w-6",
      large: "h-8 w-8",
      page: "h-10 w-10",
    },
  },
});

export function Spinner({
  size = "medium",
}: {
  size?: "small" | "medium" | "large" | "page";
}) {
  return <Loader className={spinnerVariants({ size })} />;
}
