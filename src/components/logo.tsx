import Image from "next/image";
import { cn } from "~/lib/utils";

export function Logo({
  className,
  transparent = true,
}: {
  className?: string;
  transparent?: boolean;
}) {
  if (transparent) {
    return (
      <div className={cn("h-12 overflow-hidden", className)}>
        <Image
          src="/images/gear-dark-transparent.png"
          alt="Gear Verse"
          width={256}
          height={256}
          className="hidden size-full object-cover object-center dark:block"
        />

        <Image
          src="/images/gear-light-transparent.png"
          alt="Gear Verse"
          width={256}
          height={256}
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
        width={256}
        height={256}
        className="hidden size-full scale-150 object-cover object-center dark:block"
      />

      <Image
        src="/images/gear-light.png"
        alt="Gear Verse"
        width={256}
        height={256}
        className="block size-full scale-150 object-cover object-center dark:hidden"
      />
    </div>
  );
}
