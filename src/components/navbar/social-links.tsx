import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";
import { Button } from "../ui/button";

const SOCIAL_LINKS = [
  {
    name: "Join Our Discord",
    url: "https://discord.gg/CRDZxAD35N",
    icon: IconBrandDiscord,
  },
  {
    name: "Follow Us On Tiktok",
    url: "https://www.tiktok.com/@gearverse.eg",
    icon: IconBrandTiktok,
  },
  {
    name: "Follow Us On Facebook",
    url: "https://www.facebook.com/profile.php?id=61575728973616",
    icon: IconBrandFacebook,
  },
];

export function NavSocialLinks() {
  return (
    <div className="space-y-3">
      {SOCIAL_LINKS.map((link) => (
        <Button
          key={link.name}
          size="lg"
          variant="link"
          className="w-full justify-start"
          asChild
        >
          <a href={link.url} target="_blank">
            <link.icon />
            {link.name}
          </a>
        </Button>
      ))}
    </div>
  );
}
