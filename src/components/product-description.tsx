"use client";

import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer";
import { useVerseEditor } from "~/hooks/use-verse-editor";
import { cn } from "~/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { PencilOffIcon } from "lucide-react";
export function ProductDescription({
  className,
  description,
}: {
  className?: string;
  description: JSONContent;
}) {
  const { extensions } = useVerseEditor();

  if (Object.keys(description).length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PencilOffIcon />
          </EmptyMedia>
          <EmptyTitle>No Description</EmptyTitle>
          <EmptyDescription>
            No description has been added for this product yet. To improve the
            product listing, please add a description via the admin panel.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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
