import Image from "next/image";

export function Logo() {
  return (
    <div className="h-12 overflow-hidden">
      <Image
        src="/images/gear-dark-transparent.png"
        alt="Gear Verse"
        width={100}
        height={100}
        className="hidden size-full object-cover object-center dark:block"
      />

      <Image
        src="/images/gear-light-transparent.png"
        alt="Gear Verse"
        width={100}
        height={100}
        className="block size-full object-cover object-center dark:hidden"
      />
    </div>
  );
}
