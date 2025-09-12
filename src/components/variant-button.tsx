import { cn } from "~/lib/utils";
import { ImageWithFallback } from "./image-with-fallback";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Variant {
  id: number;
  name: string;
  stock: number;
  price: number;
  thumbnail: {
    url: string;
    id: number;
  } | null;
}

export function VariantButton({
  variant,
  className,
  ...props
}: {
  variant: Variant;
  className?: string;
} & React.ComponentProps<"button">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "ring-primary focus-visible:ring-ring relative size-16 cursor-pointer rounded-md border transition-opacity hover:opacity-80 hover:ring-2 focus-visible:ring-2 focus-visible:outline-none",
            className,
          )}
          {...props}
        >
          <ImageWithFallback
            src={variant.thumbnail?.url}
            alt={variant.name}
            className="size-full"
            width={100}
            height={100}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{variant.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
