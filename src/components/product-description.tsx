import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer";
import { useLocale, useTranslations } from "next-intl";
import { localizedCopyProps } from "~/lib/arabic";
import { contentExtensions } from "~/lib/editor/content-extensions";
import { cn } from "~/lib/utils";

/**
 * Renders a stored description on the server with the editor's own
 * extensions, so the storefront ships none of the editor's JavaScript.
 */
export function ProductDescription({
  className,
  description,
  english,
}: {
  className?: string;
  description: JSONContent;
  /** shown in English on the Arabic site, so it reads left to right */
  english?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("products.details");
  if (Object.keys(description).length === 0) {
    return <p className="text-muted-foreground">{t("noDescription")}</p>;
  }

  return (
    // dir="auto" for copy of unknown language; on the Arabic site the read model says which it is
    <div
      dir="auto"
      className={cn(
        "prose prose-pink prose-headings:font-medium prose-headings:tracking-tight prose-strong:font-medium max-w-[68ch] self-start focus-visible:outline-none [&_img]:h-auto [&_img]:w-auto [&_img]:max-w-full",
        className,
      )}
      {...localizedCopyProps(locale, english)}
    >
      {renderToReactElement({
        content: description,
        extensions: contentExtensions,
      })}
    </div>
  );
}
