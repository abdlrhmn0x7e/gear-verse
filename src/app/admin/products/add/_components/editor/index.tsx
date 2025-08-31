"use client";

import { Bold } from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import { Heading } from "@tiptap/extension-heading";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Strike } from "@tiptap/extension-strike";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { UndoRedo } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorMenuBar } from "./editor-menu-bar";

export function Editor() {
  const editor = useEditor({
    extensions: [
      UndoRedo,

      Document,
      Text,
      Paragraph,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,

      Bold,
      Italic,
      Strike,
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["https", "http"],
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Image,
    ],
    content: "<p>Hello World! 🌎️</p>",

    editorProps: {
      attributes: {
        class: "prose max-w-none prose-pink focus-visible:outline-none",
      },
    },

    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border">
      <EditorMenuBar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
}
