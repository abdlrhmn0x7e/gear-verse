"use client";

import { GridIcon, ListIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SearchInput } from "../../inputs/search-input";

export type MediaView = "list" | "grid";

/**
 * Name search plus the list/grid switch, laid out like a list page's toolbar
 * row: search first, the view switch on the far edge. The media picker is a
 * dialog, so the search lives in its state rather than the URL; the server
 * still does the filtering.
 */
export function MediaFilters({
  search,
  onSearchChange,
  view,
  onViewChange,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  view: MediaView;
  onViewChange: (view: MediaView) => void;
}) {
  return (
    <>
      <SearchInput
        className="w-full sm:w-72"
        placeholder="Search by name"
        aria-label="Search media"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Select
        value={view}
        onValueChange={(value) => onViewChange(value as MediaView)}
      >
        <SelectTrigger className="ms-auto shrink-0" aria-label="Change view">
          {view === "grid" ? <GridIcon /> : <ListIcon />}
        </SelectTrigger>
        {/* Popper, not the preset's item-aligned: the trigger holds only an
            icon, so there is no selected value to line the list up over. */}
        <SelectContent position="popper" align="end">
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
    </>
  );
}
