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
import { FileHandler } from "@tiptap/extension-file-handler";
import { type JSONContent, useEditor } from "@tiptap/react";
import { useMemo } from "react";
import { useUploadFileMutation } from "./mutations/use-upload-file-mutation";
import { toast } from "sonner";

export function useVerseEditor({
  onUpdate,
  defaultContent,
}: {
  onUpdate?: (json: JSONContent) => void;
  defaultContent?: JSONContent;
} = {}) {
  const { mutate: uploadFile } = useUploadFileMutation();
  const extensions = useMemo(() => {
    return [
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
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
        onDrop: (currentEditor, files, pos) => {
          files.forEach((file) => {
            const uploadingFilesToast = toast.loading(
              `Uploading ${file.name}...`,
            );
            uploadFile(
              { file },
              {
                onSuccess: (data) => {
                  toast.dismiss(uploadingFilesToast);
                  currentEditor
                    .chain()
                    .insertContentAt(pos, {
                      type: "image",
                      attrs: {
                        src: data.url,
                      },
                    })
                    .focus()
                    .run();
                },
              },
            );
          });
        },
        onPaste: (currentEditor, files, htmlContent) => {
          files.forEach((file) => {
            if (htmlContent) {
              return false;
            }

            const uploadingFilesToast = toast.loading(
              `Uploading ${file.name}...`,
            );
            uploadFile(
              { file },
              {
                onSuccess: (data) => {
                  toast.dismiss(uploadingFilesToast);
                  currentEditor
                    .chain()
                    .insertContentAt(currentEditor.state.selection.anchor, {
                      type: "image",
                      attrs: {
                        src: data.url,
                      },
                    })
                    .focus()
                    .run();
                },
              },
            );
          });
        },
      }),
    ];
  }, [uploadFile]);

  const editor = useEditor({
    content: defaultContent,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
    autofocus: true,
    extensions,

    editorProps: {
      attributes: {
        class:
          "m-auto prose prose-leading-2 prose-pink focus-visible:outline-none",
      },
    },

    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  return { editor, extensions };
}
