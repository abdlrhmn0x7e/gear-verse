import { Suspense } from "react";
import { CurrentYear } from "./current-year";
import { Logo } from "./logo";
import Link from "next/link";
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";

const STORE_LINKS = [
  { title: "Home", href: "/" },
  { title: "All Products", href: "/products" },
  { title: "My Orders", href: "/orders" },
];

const SOCIAL_LINKS = [
  {
    label: "Join our Discord",
    url: "https://discord.gg/CRDZxAD35N",
    icon: IconBrandDiscord,
  },
  {
    label: "Follow us on TikTok",
    url: "https://www.tiktok.com/@gearverse.eg",
    icon: IconBrandTiktok,
  },
  {
    label: "Follow us on Facebook",
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

        <nav
          aria-label="Footer"
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm"
        >
          {STORE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary block font-medium"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-muted-foreground hover:text-primary block"
            >
              <link.icon size={20} />
            </a>
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
