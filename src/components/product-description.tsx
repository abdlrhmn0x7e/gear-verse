"use client";

import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer";
import { useVerseEditor } from "~/hooks/use-verse-editor";
import { cn } from "~/lib/utils";

export function ProductDescription({
  className,
  description,
}: {
  className?: string;
  description: JSONContent;
}) {
  const { extensions } = useVerseEditor();

  return (
    <div
      className={cn(
        "prose prose-leading-2 prose-pink m-auto focus-visible:outline-none",
        className,
      )}
    >
      {renderToReactElement({ content: description, extensions })}
    </div>
  );
}
