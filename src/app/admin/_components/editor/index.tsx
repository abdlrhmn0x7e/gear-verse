"use client";

import { AnimatePresence, motion } from "motion/react";
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
import { useVerseEditor } from "~/hooks/use-verse-editor";
import { EditorContent, type JSONContent } from "@tiptap/react";

const CustomDialogContent = motion.div;

export function Editor({
  onUpdate,
  defaultContent,
}: {
  onUpdate: (json: JSONContent) => void;
  defaultContent?: JSONContent;
}) {
  const { editor } = useVerseEditor({ onUpdate, defaultContent });
  const [isExpanded, setIsExpanded] = useState(false);

  if (!editor) return null;

  function handleExpand() {
    setIsExpanded((prev) => !prev);
  }

  return (
    <AnimatePresence>
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
