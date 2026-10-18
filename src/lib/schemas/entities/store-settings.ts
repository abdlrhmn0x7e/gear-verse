import * as z from "zod";

/** The store's contact details and social links, as the storefront reads them. */
export type StoreSettings = {
  /** E.164, e.g. "+201012345678". */
  whatsappNumber: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  xUrl: string | null;
  youtubeUrl: string | null;
  /** A variant at or below this many units counts as low on stock. */
  lowStockThreshold: number;
  /** `null` until the settings are first saved. */
  updatedAt: Date | null;
};

/**
 * What the store shows before anything is saved: the links the storefront
 * carried before they became settings, so none disappear until an admin saves.
 */
export const defaultStoreSettings: StoreSettings = {
  whatsappNumber: null,
  instagramUrl: null,
  facebookUrl: "https://www.facebook.com/profile.php?id=61575728973616",
  tiktokUrl: "https://www.tiktok.com/@gearverse.eg",
  discordUrl: "https://discord.gg/CRDZxAD35N",
  xUrl: null,
  youtubeUrl: null,
  lowStockThreshold: 2,
  updatedAt: null,
};

const E164 = /^\+[1-9]\d{7,14}$/;
const EGYPTIAN_MOBILE = /^01\d{9}$/;

/**
 * A WhatsApp number in E.164. Spaces and dashes are dropped, and an Egyptian
 * mobile written locally (01xxxxxxxxx) gains the +20 country code. Empty
 * means no number.
 */
export const whatsappNumberSchema = z
  .string()
  .nullish()
  .transform((value, ctx) => {
    const compact = (value ?? "").replace(/[\s-]/g, "");
    if (!compact) return null;

    const number = EGYPTIAN_MOBILE.test(compact) ? `+2${compact}` : compact;
    if (!E164.test(number)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Use the international format, + then 8 to 15 digits, like +20 101 234 5678",
      });
      return z.NEVER;
    }

    return number;
  });

/** The sites each social link may point at. Subdomains (www., m.) count too. */
export const socialHosts = {
  instagramUrl: { label: "Instagram", hosts: ["instagram.com"] },
  facebookUrl: { label: "Facebook", hosts: ["facebook.com", "fb.com"] },
  tiktokUrl: { label: "TikTok", hosts: ["tiktok.com"] },
  discordUrl: {
    label: "Discord",
    hosts: ["discord.gg", "discord.com", "discordapp.com"],
  },
  xUrl: { label: "X", hosts: ["x.com", "twitter.com"] },
  youtubeUrl: { label: "YouTube", hosts: ["youtube.com", "youtu.be"] },
} as const;
export type SocialField = keyof typeof socialHosts;

/**
 * An https link to a page on one of `hosts`, or empty for none. A link typed
 * without a scheme gets https://.
 */
function socialUrlSchema({
  label,
  hosts,
}: {
  label: string;
  hosts: readonly string[];
}) {
  return z
    .string()
    .nullish()
    .transform((value, ctx) => {
      const raw = (value ?? "").trim();
      if (!raw) return null;

      const withScheme = /^[a-z][a-z\d+.-]*:/i.test(raw)
        ? raw
        : `https://${raw}`;
      let url: URL;
      try {
        url = new URL(withScheme);
      } catch {
        ctx.addIssue({ code: "custom", message: "Enter a valid link" });
        return z.NEVER;
      }

      if (url.protocol !== "https:") {
        ctx.addIssue({ code: "custom", message: "Use an https:// link" });
        return z.NEVER;
      }

      const host = url.hostname.toLowerCase();
      if (!hosts.some((base) => host === base || host.endsWith(`.${base}`))) {
        ctx.addIssue({
          code: "custom",
          message: `Link to ${hosts.join(" or ")} for ${label}`,
        });
        return z.NEVER;
      }

      if (url.pathname === "/" && !url.search) {
        ctx.addIssue({
          code: "custom",
          message: `Link to the store's ${label} page, not the home page`,
        });
        return z.NEVER;
      }

      return url.href;
    });
}

export const lowStockThresholdSchema = z
  .number("Enter a number")
  .int("Use a whole number")
  .min(0, "Can't be below 0")
  .max(999, "Keep it at 999 or below");

export const updateStoreSettingsInputSchema = z.object({
  whatsappNumber: whatsappNumberSchema,
  instagramUrl: socialUrlSchema(socialHosts.instagramUrl),
  facebookUrl: socialUrlSchema(socialHosts.facebookUrl),
  tiktokUrl: socialUrlSchema(socialHosts.tiktokUrl),
  discordUrl: socialUrlSchema(socialHosts.discordUrl),
  xUrl: socialUrlSchema(socialHosts.xUrl),
  youtubeUrl: socialUrlSchema(socialHosts.youtubeUrl),
  lowStockThreshold: lowStockThresholdSchema,
});
/** What the settings form holds: text as typed, empty strings for none. */
export type UpdateStoreSettingsFormValues = z.input<
  typeof updateStoreSettingsInputSchema
>;
/** Normalised: E.164 number, full https links, `null` for empty fields. */
export type UpdateStoreSettingsInput = z.output<
  typeof updateStoreSettingsInputSchema
>;
