import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer";
import { contentExtensions } from "~/lib/editor/content-extensions";
import { cn } from "~/lib/utils";

/**
 * Renders a stored description on the server with the editor's own
 * extensions, so the storefront ships none of the editor's JavaScript.
 */
export function ProductDescription({
  className,
  description,
}: {
  className?: string;
  description: JSONContent;
}) {
  if (Object.keys(description).length === 0) {
    return (
      <p className="text-muted-foreground">
        No description has been added yet.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-pink prose-headings:font-medium prose-headings:tracking-tight prose-strong:font-medium max-w-[68ch] self-start focus-visible:outline-none [&_img]:h-auto [&_img]:w-auto [&_img]:max-w-full",
        className,
      )}
    >
      {renderToReactElement({
        content: description,
        extensions: contentExtensions,
      })}
    </div>
  );
}
