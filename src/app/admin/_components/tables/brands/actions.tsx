"use client";

import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DeleteBrandDialog } from "../../dialogs/delete-brand";
import { EditBrandDrawer } from "../../drawers/edit-brand";
import type { BrandRow } from "./columns";

export function BrandsTableActions({ brand }: { brand: BrandRow }) {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const isUsed = brand.productCount > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <span className="sr-only">Actions for {brand.name}</span>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">
              {brand.name}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setDialog("edit")}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Tooltip>
            <TooltipTrigger
              disabled={!isUsed}
              render={
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isUsed}
                  className="data-disabled:pointer-events-auto"
                  onClick={() => setDialog("delete")}
                />
              }
            >
              <Trash2Icon />
              Delete
            </TooltipTrigger>
            <TooltipContent>
              This brand is used by {brand.productCount}{" "}
              {brand.productCount === 1 ? "product" : "products"}. Move its
              products to another brand first.
            </TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditBrandDrawer
        brand={brand}
        open={dialog === "edit"}
        onOpenChange={(open) => setDialog(open ? "edit" : null)}
      />
      <DeleteBrandDialog
        brand={brand}
        open={dialog === "delete"}
        onOpenChange={(open) => setDialog(open ? "delete" : null)}
      />
    </>
  );
}
