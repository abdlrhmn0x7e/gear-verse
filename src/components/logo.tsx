import Image from "next/image";

export function Logo() {
  return (
    <div className="h-12 overflow-hidden">
      <Image
        src="/assets/gear-light-transparent.png"
        alt="Gear Verse"
        width={100}
        height={100}
        className="size-full object-cover object-center"
      />
    </div>
  );
}
