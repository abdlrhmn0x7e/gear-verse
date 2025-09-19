import Image from "next/image";
import { cn } from "~/lib/utils";

export function Logo({
  className,
  width = 138,
  height = 72,
  transparent = true,
}: {
  className?: string;
  width?: number;
  height?: number;
  transparent?: boolean;
}) {
  if (transparent) {
    return (
      <div className={cn("h-12 overflow-hidden", className)}>
        <Image
          src="/images/gear-dark-transparent.png"
          alt="Gear Verse"
          width={width}
          height={height}
          className="hidden size-full object-cover object-center dark:block"
        />

        <Image
          src="/images/gear-light-transparent.png"
          alt="Gear Verse"
          width={width}
          height={height}
          className="block size-full object-cover object-center dark:hidden"
        />
      </div>
    );
  }

  return (
    <div className={cn("h-12 overflow-hidden", className)}>
      <Image
        src="/images/gear-dark.png"
        alt="Gear Verse"
        width={width}
        height={height}
        className="hidden size-full scale-150 object-cover object-center dark:block"
      />

      <Image
        src="/images/gear-light.png"
        alt="Gear Verse"
        width={width}
        height={height}
        className="block size-full scale-150 object-cover object-center dark:hidden"
      />
    </div>
  );
}
