import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HeadingIcon,
  HighlighterIcon,
  ImageIcon,
  ImageOffIcon,
  ImagePlusIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Maximize2Icon,
  Minimize2Icon,
  RedoIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Separator } from "~/components/ui/separator";
import { FileDropzone } from "../inputs/file-dropzone";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";
import { toast } from "sonner";
import * as React from "react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import z from "zod";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { useInView } from "react-intersection-observer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Spinner } from "~/components/spinner";

export function EditorMenuBar({
  editor,
  onExpand,
  className,
  expanded,
}: {
  editor: Editor;
  onExpand: () => void;
  className?: string;
  expanded?: boolean;
}) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      canUndo: ctx.editor.can().chain().undo().run() ?? false,
      canRedo: ctx.editor.can().chain().redo().run() ?? false,

      isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,

      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,

      isBold: ctx.editor.isActive("bold") ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      isStrikethrough: ctx.editor.isActive("strike") ?? false,
      isUnderline: ctx.editor.isActive("underline") ?? false,
      isHighlight: ctx.editor.isActive("highlight") ?? false,
      isLink: ctx.editor.isActive("link") ?? false,

      isAlignLeft: ctx.editor.isActive("textAlign", { align: "left" }) ?? false,
      isAlignCenter:
        ctx.editor.isActive("textAlign", { align: "center" }) ?? false,
      isAlignRight:
        ctx.editor.isActive("textAlign", { align: "right" }) ?? false,
      isAlignJustify:
        ctx.editor.isActive("textAlign", { align: "justify" }) ?? false,
    }),
  });

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 border-b p-1",
        className,
      )}
    >
      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        disabled={!editorState.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <UndoIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        disabled={!editorState.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <RedoIcon />
      </Button>

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Heading */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button">
            <HeadingIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            variant={editorState.isHeading1 ? "destructive" : "default"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1Icon />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            variant={editorState.isHeading2 ? "destructive" : "default"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2Icon />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            variant={editorState.isHeading3 ? "destructive" : "default"}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3Icon />
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* List */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button">
            <ListIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            variant={editorState.isBulletList ? "destructive" : "default"}
          >
            <ListIcon />
            Unordered List
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant={editorState.isOrderedList ? "destructive" : "default"}
          >
            <ListOrderedIcon />
            Ordered List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Text formatting */}
      <Button
        variant={editorState.isBold ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon />
      </Button>
      <Button
        variant={editorState.isItalic ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon />
      </Button>

      <Button
        variant={editorState.isUnderline ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </Button>
      <Button
        variant={editorState.isStrikethrough ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon />
      </Button>
      <Button
        variant={editorState.isHighlight ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <HighlighterIcon />
      </Button>

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Text alignment */}
      <Button
        variant={editorState.isAlignLeft ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeftIcon />
      </Button>
      <Button
        variant={editorState.isAlignCenter ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenterIcon />
      </Button>
      <Button
        variant={editorState.isAlignRight ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRightIcon />
      </Button>
      <Button
        variant={editorState.isAlignJustify ? "default" : "ghost"}
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustifyIcon />
      </Button>

      <LinkDrawerDialog
        isLink={editorState.isLink}
        onLink={(url) => editor.chain().focus().setLink({ href: url }).run()}
      />

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Image */}
      <ImageDrawerDialog
        onImageUpload={(url) =>
          editor.chain().focus().setImage({ src: url }).run()
        }
      />

      <Button variant="ghost" type="button" onClick={onExpand}>
        {expanded ? (
          <>
            <Minimize2Icon />
            Minimize
          </>
        ) : (
          <>
            <Maximize2Icon />
            Expand
          </>
        )}
      </Button>
    </div>
  );
}

function ImageDrawerDialog({
  onImageUpload,
}: {
  onImageUpload: (url: string) => void;
}) {
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const { mutate: uploadFile, isPending: isUploading } =
    useUploadFileMutation();
  function handleAddImage(files: File[]) {
    const file = files[0];
    if (!file) return;

    uploadFile(
      { file },
      {
        onSuccess: (data) => {
          onImageUpload(data.url);
          setImageDialogOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to upload file", {
            description: error.message,
          });
        },
      },
    );
  }

  return (
    <DrawerDialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
      <DrawerDialogTrigger asChild>
        <Button variant="ghost" type="button">
          <ImagePlusIcon />
          Add
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent className="sm:max-w-2xl">
        <DrawerDialogHeader>
          <div className="flex items-center gap-2">
            <ImagePlusIcon />
            <DrawerDialogTitle>Add Image</DrawerDialogTitle>
          </div>
          <DrawerDialogDescription>
            Add an image to the editor
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <Tabs defaultValue="upload-media">
          <TabsList>
            <TabsTrigger value="upload-media">
              <ImagePlusIcon />
              Upload Media
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon />
              Gallery
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gallery">
            <ImageGallery
              addImage={(url) => {
                onImageUpload(url);
                setImageDialogOpen(false);
              }}
            />
          </TabsContent>
          <TabsContent value="upload-media">
            <FileDropzone
              onChange={handleAddImage}
              isLoading={isUploading}
              className="min-h-[24rem]"
              showFiles={false}
              maxFiles={1}
            />
          </TabsContent>
        </Tabs>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}

function ImageGallery({ addImage }: { addImage: (url: string) => void }) {
  const {
    data: images,
    isPending: imagesPending,
    isError: imagesError,
    fetchNextPage,
    hasNextPage,
  } = api.media.getPage.useInfiniteQuery(
    {
      pageSize: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const imagesData = images?.pages.flatMap((page) => page.data);

  if (imagesPending) {
    return (
      <div className="min-h-[24rem]">
        <div className="grid grid-cols-3 gap-4 p-1">
          {Array.from({ length: 9 }).map((_, index) => (
            <AspectRatio
              key={`image-skeleton-${index}`}
              ratio={16 / 9}
              className="bg-muted overflow-hidden rounded-lg"
            >
              <Skeleton className="size-full" />
            </AspectRatio>
          ))}
        </div>
      </div>
    );
  }

  if (imagesError) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center gap-2 p-1">
        <ImageOffIcon size={48} />
        <p className="text-muted-foreground text-center">
          An error occurred while loading images
        </p>
      </div>
    );
  }

  if (!imagesData?.length) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center gap-2 p-1">
        <ImageOffIcon size={48} />
        <p className="text-muted-foreground text-center">No images found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[24rem]">
      <div className="grid grid-cols-3 gap-4 p-1">
        {imagesData.map((image, idx) => (
          <AspectRatio
            key={`image-${image.id}-${idx}`}
            ratio={16 / 9}
            className="bg-muted ring-primary cursor-pointer overflow-hidden rounded-lg border ring-0 transition-all hover:opacity-80 hover:ring-2"
            role="button"
            onClick={() => addImage(image.url)}
          >
            <Image
              alt={`Media Image ${image.id}`}
              src={image.url}
              height={100}
              width={100}
              className="size-full object-cover"
            />
          </AspectRatio>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex items-center justify-center p-4" ref={ref}>
          <Spinner />
        </div>
      )}
    </ScrollArea>
  );
}

function LinkDrawerDialog({
  isLink,
  onLink,
}: {
  isLink: boolean;
  onLink: (url: string) => void;
}) {
  const [url, setUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  function handleLink() {
    const urlSchema = z.url();
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      console.log("Invalid URL", result.error);
      toast.error("Invalid URL. Please enter a valid URL.");
      return;
    }

    onLink(result.data);

    setUrl("");
    setOpen(false);
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button
          variant={isLink ? "default" : "ghost"}
          size="icon"
          type="button"
        >
          <LinkIcon />
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>Add Link</DrawerDialogTitle>
          <DrawerDialogDescription>
            Add a link to the editor
          </DrawerDialogDescription>
        </DrawerDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={url}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLink();
              }
            }}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <DrawerDialogFooter>
          <Button type="button" onClick={handleLink}>
            <LinkIcon />
            Add Link
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
