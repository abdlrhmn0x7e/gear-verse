"use client";

import Document from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { UndoRedo } from "@tiptap/extensions";
import {
  EditorContent,
  mergeAttributes,
  Node,
  nodeInputRule,
  useEditor,
  type JSONContent,
} from "@tiptap/react";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  isOrderMessagePlaceholder,
  orderMessagePlaceholders,
  orderMessageSampleValues,
  PLACEHOLDER_PATTERN,
  renderOrderMessage,
  type OrderMessagePlaceholder,
} from "~/lib/order-message";
import { cn } from "~/lib/utils";

const placeholderLabels = Object.fromEntries(
  orderMessagePlaceholders.map(({ key, label }) => [key, label]),
) as Record<OrderMessagePlaceholder, string>;

/** A `{{key}}` token shown as one chip, so it can't be half deleted or mistyped. */
const Placeholder = Node.create({
  name: "placeholder",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-placeholder"),
        renderHTML: (attributes: { key: string }) => ({
          "data-placeholder": attributes.key,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-placeholder]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class:
          "bg-brand-subtle text-brand-text mx-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        dir: "ltr",
      }),
      placeholderLabels[node.attrs.key as OrderMessagePlaceholder] ??
        node.attrs.key,
    ];
  },

  renderText({ node }) {
    return `{{${node.attrs.key}}}`;
  },

  addInputRules() {
    const keys = orderMessagePlaceholders.map(({ key }) => key).join("|");
    return [
      nodeInputRule({
        find: new RegExp(`\\{\\{(${keys})\\}\\}$`),
        type: this.type,
        getAttributes: (match) => ({ key: match[1] }),
      }),
    ];
  },
});

/** One paragraph per line, each `{{key}}` of a known placeholder as a chip. */
function toDoc(template: string): JSONContent {
  return {
    type: "doc",
    content: template.split("\n").map((line) => {
      const content: JSONContent[] = [];
      let last = 0;
      for (const match of line.matchAll(PLACEHOLDER_PATTERN)) {
        const key = match[1]!;
        if (!isOrderMessagePlaceholder(key)) continue;
        if (match.index > last) {
          content.push({ type: "text", text: line.slice(last, match.index) });
        }
        content.push({ type: "placeholder", attrs: { key } });
        last = match.index + match[0].length;
      }
      if (last < line.length) {
        content.push({ type: "text", text: line.slice(last) });
      }
      return { type: "paragraph", content };
    }),
  };
}

/**
 * A WhatsApp message with `{{placeholder}}` tokens, edited as text with the
 * tokens as chips, and a preview filled with sample values below it.
 */
export function MessageTemplateEditor({
  value,
  onChange,
  label,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  /** the field's name for screen readers, which can't follow a label to a contenteditable */
  label: string;
  invalid?: boolean;
}) {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Placeholder, UndoRedo],
    content: toDoc(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-56 px-3 py-2.5 text-sm/6 outline-none [&_p]:min-h-6 whitespace-pre-wrap",
        dir: "auto",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getText({ blockSeparator: "\n" }));
    },
  });

  // a form reset (save or discard) replaces the text from outside
  useEffect(() => {
    if (editor && editor.getText({ blockSeparator: "\n" }) !== value) {
      editor.commands.setContent(toDoc(value), { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="flex flex-col gap-3">
      {editor ? (
        <div
          aria-invalid={invalid}
          className={cn(
            "surface-control surface-field focus-within:ring-ring/50 rounded-lg transition-[box-shadow,border-color] focus-within:ring-[3px]",
            invalid && "border-destructive",
          )}
        >
          <EditorContent editor={editor} />
        </div>
      ) : (
        <Skeleton className="h-56 w-full rounded-lg" />
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground me-1 text-xs">Insert</span>
        {orderMessagePlaceholders.map(({ key, label: placeholderLabel }) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            size="xs"
            disabled={!editor}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertContent({ type: "placeholder", attrs: { key } })
                .run()
            }
          >
            <PlusIcon />
            {placeholderLabel}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs">
          Preview with a sample order
        </span>
        <p
          dir="auto"
          className="bg-muted/60 rounded-lg px-3 py-2.5 text-sm/6 whitespace-pre-wrap"
        >
          {renderOrderMessage(value, orderMessageSampleValues)}
        </p>
      </div>
    </div>
  );
}
