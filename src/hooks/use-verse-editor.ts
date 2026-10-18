import { UndoRedo } from "@tiptap/extensions";
import { FileHandler } from "@tiptap/extension-file-handler";
import { type JSONContent, useEditor } from "@tiptap/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { contentExtensions } from "~/lib/editor/content-extensions";
import { useUploadFilesMutation } from "./mutations/use-upload-files-mutations";

export function useVerseEditor({
  onUpdate,
  defaultContent,
}: {
  onUpdate?: (json: JSONContent) => void;
  defaultContent?: JSONContent;
} = {}) {
  const { mutate: uploadFiles } = useUploadFilesMutation();
  const extensions = useMemo(() => {
    return [
      UndoRedo,

      ...contentExtensions,

      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
        ],
        onDrop: (currentEditor, files, pos) => {
          const uploadingFilesToast = toast.loading(
            `Uploading ${files.map((file) => file.name).join(", ")}...`,
          );
          uploadFiles(files, {
            onError: () => toast.dismiss(uploadingFilesToast),
            onSuccess: (data) => {
              toast.dismiss(uploadingFilesToast);
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: "image",
                  attrs: {
                    src: data.map((item) => item.url),
                  },
                })
                .focus()
                .run();
            },
          });
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent) {
            return false;
          }

          const uploadingFilesToast = toast.loading(
            `Uploading ${files.map((file) => file.name).join(", ")}...`,
          );
          uploadFiles(files, {
            onError: () => toast.dismiss(uploadingFilesToast),
            onSuccess: (data) => {
              toast.dismiss(uploadingFilesToast);
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: "image",
                  attrs: {
                    src: data.map((item) => item.url),
                  },
                })
                .focus()
                .run();
            },
          });
        },
      }),
    ];
  }, [uploadFiles]);

  const editor = useEditor({
    // a new product starts its description as {}, which isn't a document
    content: defaultContent?.type ? defaultContent : undefined,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
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
