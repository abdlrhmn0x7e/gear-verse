import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import {
  socialHosts,
  type SocialField,
  type StoreSettings,
} from "~/lib/schemas/entities/store-settings";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

/** Just the social links from the store settings, small enough to hand to a client component. */
export type SocialLinksSettings = Pick<StoreSettings, SocialField>;

export function pickSocialLinks(settings: StoreSettings): SocialLinksSettings {
  return {
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    tiktokUrl: settings.tiktokUrl,
    xUrl: settings.xUrl,
    youtubeUrl: settings.youtubeUrl,
    discordUrl: settings.discordUrl,
  };
}

/** In the order they show. */
const SOCIAL_ICONS: { field: SocialField; icon: typeof IconBrandInstagram }[] =
  [
    { field: "instagramUrl", icon: IconBrandInstagram },
    { field: "facebookUrl", icon: IconBrandFacebook },
    { field: "tiktokUrl", icon: IconBrandTiktok },
    { field: "xUrl", icon: IconBrandX },
    { field: "youtubeUrl", icon: IconBrandYoutube },
    { field: "discordUrl", icon: IconBrandDiscord },
  ];

/** An icon button per social link the store has filled in; nothing when none are. `ghost` is for menus, where the
 * icons are a footnote rather than a row of outlined controls. */
export function SocialLinks({
  links,
  variant = "outline",
  className,
}: {
  links: SocialLinksSettings;
  variant?: "outline" | "ghost";
  className?: string;
}) {
  const filled = SOCIAL_ICONS.flatMap(({ field, icon }) => {
    const url = links[field];
    return url ? [{ url, icon, label: socialHosts[field].label }] : [];
  });

  if (filled.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {filled.map((link) => (
        <li key={link.url}>
          <Button
            variant={variant}
            size="icon-lg"
            className={cn(variant === "ghost" && "text-muted-foreground")}
            nativeButton={false}
            render={
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Gear Verse on ${link.label}`}
              />
            }
          >
            <link.icon stroke={1.75} aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
