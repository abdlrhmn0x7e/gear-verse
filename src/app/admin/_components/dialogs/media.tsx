"use client";

import {
  CloudUploadIcon,
  EyeIcon,
  GridIcon,
  ImageIcon,
  ImageOffIcon,
  ListIcon,
  MousePointerClickIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { SearchInput } from "../inputs/search-input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { api, type RouterOutputs } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";
import Header from "~/components/header";
import { useUploadFilesMutation } from "~/hooks/mutations/use-upload-files-mutations";
import { MediaTable } from "../tables/media/table";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Checkbox } from "~/components/ui/checkbox";
import { keepPreviousData } from "@tanstack/react-query";
import { LoadMore } from "~/components/load-more";
import { useInView } from "react-intersection-observer";
import { useMediaStore } from "../../_stores/media/provider";
import type { SelectedMedia } from "../../_stores/media/store";
import type { FileDropZoneProps } from "../inputs/file-dropzone";
import { toast } from "sonner";
import { AspectRatio } from "~/components/ui/aspect-ratio";

export function MediaDialog({
  children,
  onChange,
}: {
  children: React.ReactNode;
  onChange?: (media: SelectedMedia[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewKind, setViewKind] = useState<"list" | "grid">("list");

  const previewUrl = useMediaStore((state) => state.previewUrl);
  const selectedMedia = useMediaStore((state) => state.selectedMedia);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="relative z-10" asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <SearchInput
              placeholder="Search media by name"
              className="max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              value={viewKind}
              onValueChange={(value) => setViewKind(value as "list" | "grid")}
            >
              <SelectTrigger>
                {viewKind === "grid" ? <GridIcon /> : <ListIcon />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">
                  <ListIcon />
                  List view
                </SelectItem>
                <SelectItem value="grid">
                  <GridIcon />
                  Grid view
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex h-[50svh] w-full gap-6 overflow-hidden xl:h-[60svh]">
            <motion.div
              className="flex min-w-0 flex-1 flex-col gap-4"
              transition={{ ease: "easeInOut", duration: 0.2 }}
              layout="position"
            >
              <MediaFileDropzone />

              <div className="flex h-[calc(60svh-12rem)] flex-1 flex-col gap-4">
                <Header
                  title="Media gallery"
                  description="Select existing media from the gallery"
                  Icon={ImageIcon}
                  headingLevel={5}
                />

                <MediaGallery search={search} viewKind={viewKind} />
              </div>
            </motion.div>

            <AnimatePresence mode="popLayout" initial={false}>
              {previewUrl && (
                <motion.div
                  layoutId="media-preview"
                  layout
                  initial={{ opacity: 0, translateX: 100 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: 100 }}
                  transition={{
                    ease: "easeOut",
                    duration: 0.2,
                  }}
                  className="flex w-1/3 items-start justify-center"
                >
                  <MediaPreview url={previewUrl} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (selectedMedia.length === 0) {
                toast.error("Please select at least one media");
                return;
              }

              onChange?.(selectedMedia);
              setOpen(false);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaFileDropzone({ options = {}, className }: FileDropZoneProps) {
  const { mutate: uploadFiles, isPending } = useUploadFilesMutation();

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      uploadFiles(acceptedFiles);
    },
    [uploadFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    disabled: isPending,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    ...options,
  });

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "hover:bg-input/30 bg-input/20 flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border-1 border-dashed p-4 text-center transition-colors duration-100",
          isDragActive && "bg-input/60",
          isPending && "hover:bg-input/20 pointer-events-none opacity-50",
          className,
        )}
        {...getRootProps()}
      >
        {/* 
					This input has it's own state away from any
					external state which could be a problem 
				*/}
        <input {...getInputProps()} />

        {isDragActive ? (
          <>
            <MousePointerClickIcon
              size={32}
              className="text-muted-foreground"
            />

            <p className="text-muted-foreground text-sm select-none">
              Drop files here to upload
            </p>
          </>
        ) : isPending ? (
          <>
            <Spinner size="medium" />

            <p className="text-muted-foreground text-sm select-none">
              Uploading files...
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <UploadCloudIcon size={16} className="text-muted-foreground" />

              <p className="text-muted-foreground text-sm select-none">
                Drag and drop files here, click to select files
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button type="button" size="sm">
                <CloudUploadIcon />
                Click to select files
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaGallery({
  search,
  viewKind,
}: {
  search: string;
  viewKind: "list" | "grid";
}) {
  const debouncedSearch = useDebounce(search, 500);

  const {
    data: mediaPages,
    isPending,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isError,
  } = api.admin.media.queries.getPage.useInfiniteQuery(
    {
      pageSize: 10,
      filters: {
        name: debouncedSearch,
      },
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
    },
  );
  const media = useMemo(
    () => mediaPages?.pages.flatMap((page) => page.data),
    [mediaPages],
  );
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="medium" />
      </div>
    );
  }

  if (isError || !media) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <ImageOffIcon size={64} className="text-muted-foreground" />
        <p className="text-muted-foreground select-none">
          Error loading media.
        </p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <ImageOffIcon size={64} className="text-muted-foreground" />
        <p className="text-muted-foreground select-none">No media found.</p>
      </div>
    );
  }

  const renderMedia = () => {
    switch (viewKind) {
      case "list":
        return (
          <MediaTable data={media} className={cn(isFetching && "opacity-50")} />
        );
      case "grid":
        return (
          <MediaGrid media={media} className={cn(isFetching && "opacity-50")} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {renderMedia()}
      <LoadMore hasNextPage={hasNextPage} ref={ref} />
    </div>
  );
}

function MediaGrid({
  media,
  className,
}: {
  media: RouterOutputs["admin"]["media"]["queries"]["getPage"]["data"];
  className?: string;
}) {
  const selectedMedia = useMediaStore((state) => state.selectedMedia);
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);
  const mediaPreviewUrl = useMediaStore((state) => state.previewUrl);
  const setMediaPreviewUrl = useMediaStore((state) => state.setPreviewUrl);
  const maxFiles = useMediaStore((state) => state.maxFiles);

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {media.map((media) => {
        const currentChecked = selectedMedia.some(
          (m) => m.mediaId === media.id,
        );
        function handleCheckedChange(checked: boolean) {
          if (maxFiles === 1) {
            setSelectedMedia([{ mediaId: media.id, url: media.url }]);
            return;
          }

          if (maxFiles && selectedMedia.length >= maxFiles) {
            toast.error(`You can only select up to ${maxFiles} media`);
            return;
          }

          return setSelectedMedia(
            checked
              ? [
                  ...selectedMedia,
                  {
                    mediaId: media.id,
                    url: media.url,
                  },
                ]
              : selectedMedia.filter((m) => m.mediaId !== media.id),
          );
        }

        return (
          <div
            key={`media-preview-${media.id}`}
            onClick={() => handleCheckedChange(!currentChecked)}
            className="group hover:bg-input/30 relative flex flex-col items-center gap-2 rounded-lg p-2"
          >
            <Checkbox
              className="bg-background absolute top-4 left-4"
              checked={currentChecked}
              onCheckedChange={handleCheckedChange}
            />
            <div className="absolute right-4 bottom-15">
              <Button
                size="icon"
                className={cn(
                  "size-8 p-0 opacity-0 group-hover:opacity-100",
                  mediaPreviewUrl === media.url && "opacity-100",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (mediaPreviewUrl === media.url) {
                    setMediaPreviewUrl(null);
                    return;
                  }

                  setMediaPreviewUrl(media.url);
                }}
              >
                <EyeIcon />
              </Button>
            </div>
            <ImageWithFallback
              src={media.url}
              alt={media.name}
              className="size-32 rounded-lg"
              width={128}
              height={128}
            />

            <div className="text-center">
              <p className="text-muted-foreground max-w-32 truncate text-sm select-none">
                {media.name}
              </p>
              <p className="text-muted-foreground text-xs select-none">
                {media.mimeType.split("/")[1]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MediaPreview({ url }: { url: string }) {
  const setMediaPreviewUrl = useMediaStore((state) => state.setPreviewUrl);

  return (
    <div className="bg-input/20 mr-1 h-fit w-full space-y-3 rounded-lg border border-dashed px-4 pt-2 pb-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-muted-foreground font-medium select-none">Preview</p>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => {
            setMediaPreviewUrl(null);
          }}
        >
          <XIcon />
        </Button>
      </div>

      <AspectRatio ratio={1} className="">
        <ImageWithFallback
          src={url}
          alt="Media preview"
          className="size-full"
          width={512}
          height={512}
        />
      </AspectRatio>
    </div>
  );
}
