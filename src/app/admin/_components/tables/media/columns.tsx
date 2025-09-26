/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { EyeIcon, FileIcon } from "lucide-react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

import type { RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { useMediaStore } from "../../../_stores/media/provider";

type Media =
  RouterOutputs["admin"]["media"]["queries"]["getPage"]["data"][number];
export const mediaColumns: ColumnDef<Media>[] = [
  {
    id: "select",
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const mediaPreviewUrl = useMediaStore((state) => state.previewUrl);
      const setMediaPreviewUrl = useMediaStore((state) => state.setPreviewUrl);

      return (
        <div className="group flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageWithFallback
              src={row.original.url}
              alt={row.original.name}
              width={24}
              height={24}
            />
            <p>{row.original.name}</p>
          </div>

          <Button
            variant={mediaPreviewUrl === row.original.url ? "default" : "ghost"}
            className={cn(
              "opacity-0 transition-opacity duration-100 group-hover:opacity-100",
              mediaPreviewUrl === row.original.url && "opacity-100",
            )}
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (mediaPreviewUrl === row.original.url) {
                setMediaPreviewUrl(null);
                return;
              }

              setMediaPreviewUrl(row.original.url);
            }}
          >
            <EyeIcon />
          </Button>
        </div>
      );
    },
  },
  {
    id: "mimeType",
    accessorKey: "mimeType",
    header: "MIME Type",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          <FileIcon />
          {row.original.mimeType.split("/")[1]}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(row.original.createdAt, "MMM dd, yyyy");
    },
  },
];
