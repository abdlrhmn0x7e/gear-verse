import { Suspense } from "react";
import { CurrentYear } from "./current-year";
import { Logo } from "./logo";
import Link from "next/link";
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";

const SOCIAL_LINKS = [
  {
    url: "https://discord.gg/CRDZxAD35N",
    icon: IconBrandDiscord,
  },
  {
    url: "https://www.tiktok.com/@gearverse.eg",
    icon: IconBrandTiktok,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61575728973616",
    icon: IconBrandFacebook,
  },
];

export function Footer() {
  return (
    <footer className="bg-muted pt-16 pb-24 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/" aria-label="go home" className="mx-auto block size-fit">
          <Logo />
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary block"
            >
              <link.icon size={20} />
            </Link>
          ))}
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          ©{" "}
          <Suspense>
            <CurrentYear />
          </Suspense>{" "}
          Gear Verse, All rights reserved
        </span>
      </div>
    </footer>
  );
}
