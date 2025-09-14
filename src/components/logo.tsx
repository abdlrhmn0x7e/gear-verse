import Image from "next/image";
import { cn } from "~/lib/utils";

export function Logo({ className }: { className?: string }) {
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
