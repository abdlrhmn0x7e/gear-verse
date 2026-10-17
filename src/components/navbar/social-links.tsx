import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";

export const SOCIAL_LINKS = [
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
] as const;
