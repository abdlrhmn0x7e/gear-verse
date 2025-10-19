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
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Separator } from "~/components/ui/separator";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { MediaDialog } from "../dialogs/media";
import type { SelectedMedia } from "../../_stores/media/store";

export function EditorMenuBar({
  editor,
  onExpand,
  className,
  expanded,
  disableTooltips,
}: {
  editor: Editor;
  onExpand: () => void;
  className?: string;
  expanded?: boolean;
  disableTooltips?: boolean;
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

  function MaybeTooltip({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) {
    if (disableTooltips) return <>{children}</>;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 border-b p-0.5",
        className,
      )}
    >
      {/* Undo / Redo */}
      <MaybeTooltip label="Undo">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          disabled={!editorState.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <UndoIcon />
        </Button>
      </MaybeTooltip>
      <MaybeTooltip label="Redo">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          disabled={!editorState.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <RedoIcon />
        </Button>
      </MaybeTooltip>

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Heading */}
      <DropdownMenu>
        <MaybeTooltip label="Headings">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button">
              <HeadingIcon />
            </Button>
          </DropdownMenuTrigger>
        </MaybeTooltip>
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
        <MaybeTooltip label="Lists">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button">
              <ListIcon />
            </Button>
          </DropdownMenuTrigger>
        </MaybeTooltip>
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
      <MaybeTooltip label="Bold">
        <Button
          variant={editorState.isBold ? "default" : "ghost"}
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </Button>
      </MaybeTooltip>
      <MaybeTooltip label="Italic">
        <Button
          variant={editorState.isItalic ? "default" : "ghost"}
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </Button>
      </MaybeTooltip>

      <MaybeTooltip label="Underline">
        <Button
          variant={editorState.isUnderline ? "default" : "ghost"}
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </Button>
      </MaybeTooltip>
      <MaybeTooltip label="Strikethrough">
        <Button
          variant={editorState.isStrikethrough ? "default" : "ghost"}
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon />
        </Button>
      </MaybeTooltip>
      <MaybeTooltip label="Highlight">
        <Button
          variant={editorState.isHighlight ? "default" : "ghost"}
          size="icon"
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <HighlighterIcon />
        </Button>
      </MaybeTooltip>

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Text alignment */}
      <DropdownMenu>
        <MaybeTooltip label="Alignment">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button">
              <AlignJustifyIcon />
            </Button>
          </DropdownMenuTrigger>
        </MaybeTooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            variant={editorState.isBulletList ? "destructive" : "default"}
          >
            <AlignLeftIcon />
            Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant={editorState.isOrderedList ? "destructive" : "default"}
          >
            <AlignCenterIcon />
            Center
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant={editorState.isOrderedList ? "destructive" : "default"}
          >
            <AlignRightIcon />
            Right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant={editorState.isOrderedList ? "destructive" : "default"}
          >
            <AlignJustifyIcon />
            Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LinkDrawerDialog
        isLink={editorState.isLink}
        onLink={(url) => editor.chain().focus().setLink({ href: url }).run()}
        disableTooltips={disableTooltips}
      />

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />

      {/* Image */}
      <ImageDrawerDialog
        onImageUpload={(urls) =>
          editor
            .chain()
            .insertContent({
              type: "image",
              attrs: {
                src: urls,
              },
            })
            .focus()
            .run()
        }
        disableTooltips={disableTooltips}
      />

      <MaybeTooltip label={expanded ? "Minimize" : "Expand"}>
        <Button variant="ghost" type="button" onClick={onExpand}>
          {expanded ? <Minimize2Icon /> : <Maximize2Icon />}
        </Button>
      </MaybeTooltip>
    </div>
  );
}

function ImageDrawerDialog({
  onImageUpload,
  disableTooltips,
}: {
  onImageUpload: (urls: string[]) => void;
  disableTooltips?: boolean;
}) {
  function handleAddImage(files: SelectedMedia[]) {
    if (!files.length) return;

    onImageUpload(files.map((file) => file.url));
  }

  return (
    <MediaDialog onChange={handleAddImage}>
      {disableTooltips ? (
        <Button variant="ghost" type="button">
          <ImagePlusIcon />
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerDialogTrigger asChild>
              <Button variant="ghost" type="button">
                <ImagePlusIcon />
              </Button>
            </DrawerDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Add image</TooltipContent>
        </Tooltip>
      )}
    </MediaDialog>
  );
}

function ImageGallery({ addImage }: { addImage: (url: string) => void }) {
  const {
    data: images,
    isPending: imagesPending,
    isError: imagesError,
    fetchNextPage,
    hasNextPage,
  } = api.admin.media.queries.getPage.useInfiniteQuery(
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
              height={256}
              width={256}
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
  disableTooltips,
}: {
  isLink: boolean;
  onLink: (url: string) => void;
  disableTooltips?: boolean;
}) {
  const [url, setUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  function handleLink() {
    const urlSchema = z.url();
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      toast.error("Invalid URL. Please enter a valid URL.");
      return;
    }

    onLink(result.data);

    setUrl("");
    setOpen(false);
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      {disableTooltips ? (
        <DrawerDialogTrigger asChild>
          <Button
            variant={isLink ? "default" : "ghost"}
            size="icon"
            type="button"
          >
            <LinkIcon />
          </Button>
        </DrawerDialogTrigger>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerDialogTrigger asChild>
              <Button
                variant={isLink ? "default" : "ghost"}
                size="icon"
                type="button"
              >
                <LinkIcon />
              </Button>
            </DrawerDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>
      )}
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
