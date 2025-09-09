"use client";

import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer";
import { useVerseEditor } from "~/hooks/use-verse-editor";

export function ProductDescription({
  description,
}: {
  description: JSONContent;
}) {
  const { extensions } = useVerseEditor();

  return (
    <div className="prose prose-leading-2 prose-pink m-auto focus-visible:outline-none">
      {renderToReactElement({ content: description, extensions })}
    </div>
  );
}
