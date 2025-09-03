"use client";

import { AnimatePresence, motion } from "motion/react";
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
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { EditorMenuBar } from "./editor-menu-bar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "~/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";

const CustomDialogContent = motion.div;

export function Editor({
  onUpdate,
}: {
  onUpdate: (json: JSONContent) => void;
}) {
  const editor = useEditor({
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
    autofocus: true,
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
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["https", "http"],
        HTMLAttributes: {
          class: "text-primary cursor-pointer",
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "size-full object-contain rounded-md overflow-hidden",
          width: "200px",
        },
      }),
    ],

    editorProps: {
      attributes: {
        class:
          "m-auto prose prose-leading-2 prose-pink focus-visible:outline-none",
      },
    },

    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  if (!editor) return null;

  function handleExpand() {
    setIsExpanded((prev) => !prev);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="bg-card flex min-h-[28rem] max-w-full flex-col gap-1 overflow-hidden rounded-lg border"
        layoutId="editor-container"
        key="editor-container-collapsed"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      >
        {!isExpanded && (
          <>
            <EditorMenuBar
              editor={editor}
              onExpand={handleExpand}
              expanded={isExpanded}
              className="shrink-0"
            />

            <ScrollArea className="h-[24rem] p-4">
              <EditorContent editor={editor} className="w-full" />
            </ScrollArea>
          </>
        )}
      </motion.div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content asChild>
            <CustomDialogContent
              className={cn(
                "bg-card fixed top-[50%] left-[50%] z-50 flex h-[95svh] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col gap-1 rounded-lg border p-6 shadow-lg sm:max-w-[80svw]",
              )}
              layoutId="editor-container"
              key="editor-container-expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <DialogHeader className="hidden">
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>

              {isExpanded && (
                <>
                  <EditorMenuBar
                    editor={editor}
                    onExpand={handleExpand}
                    className="shrink-0"
                    expanded={isExpanded}
                  />

                  <ScrollArea className="flex-1 p-4">
                    <div className="h-[80svh]">
                      <EditorContent editor={editor} className="w-full pb-24" />
                    </div>
                  </ScrollArea>
                </>
              )}
            </CustomDialogContent>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </AnimatePresence>
  );
}
